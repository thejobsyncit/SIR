import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import { InternationalConsultingForm } from '../components/InternationalConsultingForm';
import ScrollReveal from '../components/ScrollReveal';
import { trackServiceView, trackCtaClick } from '../services/analytics';
import { 
  Globe, Compass, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Calendar, ShieldCheck, Award, FileText, Users, DollarSign, Clock, HelpCircle,
  Sparkles, GraduationCap, Building2, ExternalLink, MapPin, Check, BookOpen, Send,
  AlertCircle, Briefcase, FileCheck, Landmark, Plane, BadgeCheck
} from 'lucide-react';

export const InternationalConsultingPage = () => {
  const { navigateTo } = useApp();
  const [selectedDestinationKey, setSelectedDestinationKey] = useState('uk');
  const [formPreselectedDestination, setFormPreselectedDestination] = useState('United Kingdom');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    trackServiceView('intl-consult', 'International Consulting', 'Consulting');
  }, []);

  // Section 2: Key Information Data
  const keyInfoBlocks = [
    {
      icon: Globe,
      label: 'Destinations',
      value: 'UK, USA, Canada, Australia, Europe and UAE',
      subtext: '6 Premier Global Corridors'
    },
    {
      icon: GraduationCap,
      label: 'Academic Levels',
      value: 'Undergraduate, Postgraduate and Executive MBA',
      subtext: 'Bachelors, Masters, PhD & Executive'
    },
    {
      icon: Users,
      label: 'Consultation Model',
      value: 'Personalized One-to-One Guidance',
      subtext: 'Dedicated Global Advisory Advisors'
    },
    {
      icon: Calendar,
      label: 'Intake Planning',
      value: 'Fall, Spring and Summer Intakes',
      subtext: 'Comprehensive 12-Month Roadmap'
    }
  ];

  // Section 3: Four Pillars of International Consulting
  const fourPillars = [
    {
      id: '01',
      title: 'Academic Profile & Credential Evaluation',
      desc: 'Comprehensive diagnostic appraisal of your academic transcripts, secondary or tertiary qualifications, prerequisite subjects, and standardized test metrics to identify ideal institutions.',
      icon: FileText,
      deliverables: [
        'Review academic transcripts, grades, qualifications and English proficiency scores.',
        'Identify suitable universities and programs based on the student’s profile.',
        'Assess admission requirements and prerequisite subjects.',
        'Provide a personalized university shortlist.'
      ]
    },
    {
      id: '02',
      title: 'Destination & Country Comparison',
      desc: 'Objective, evidence-based comparative analysis across study destinations to help students and families evaluate curriculum models, living conditions, and post-study opportunities.',
      icon: Compass,
      deliverables: [
        'Compare universities and study destinations.',
        'Review tuition fees, estimated living expenses and scholarship opportunities.',
        'Explain course duration and available post-study pathways.',
        'Provide a structured destination comparison based on the student’s priorities.'
      ]
    },
    {
      id: '03',
      title: 'Budget, Financial Planning & Scholarships',
      desc: 'Transparent multi-year cost forecasting covering tuition schedules, living costs, proof of funds requirements, and institutional merit scholarship opportunities.',
      icon: DollarSign,
      deliverables: [
        'Estimate tuition fees and living costs.',
        'Explain scholarship opportunities and eligibility requirements.',
        'Help students understand financial documentation requirements.',
        'Prepare a personalized education budget.'
      ]
    },
    {
      id: '04',
      title: 'Student Visa & Immigration Guidance',
      desc: 'Authoritative navigation of destination-specific student visa application protocols, financial evidence preparation, and the latest official immigration requirements.',
      icon: ShieldCheck,
      deliverables: [
        'Explain general student visa application requirements.',
        'Provide a destination-specific document checklist.',
        'Guide students on financial evidence and application preparation.',
        'Explain the importance of checking current official immigration requirements.'
      ]
    }
  ];

  // Section 4: Interactive Study Destination Explorer Data (Strictly verified facts, clearly labeled estimates with sources)
  const studyDestinations = {
    'uk': {
      name: 'United Kingdom',
      flag: '🇬🇧',
      badge: 'Premier Academic Heritage & 1-Year Master’s',
      popularStudyOptions: [
        'Business Administration, Finance & FinTech',
        'Computer Science, Artificial Intelligence & Cybersecurity',
        'Law (LLB & LLM) & International Commercial Law',
        'Data Science & Advanced Analytics',
        'Biomedical Sciences, Public Health & Biotechnology',
        'Mechanical, Aerospace & Civil Engineering'
      ],
      admissionRequirements: [
        'Undergraduate: A-Levels (AAA to BBC), IB Diploma (30–36 points), or recognized national 12th standard (75%–90% depending on course selectivity).',
        'Postgraduate: Recognized Bachelor’s degree with UK 2:1 or 2:2 equivalence (typically 60%–70% or GPA 3.0/4.0 minimum).',
        'Course Prerequisites: Specific mathematics, science, or technical coursework required for STEM and quantitative degrees.',
        'Application System: Direct portal admissions or centralized UCAS submission for undergraduate entry.'
      ],
      tuitionExpenses: '£14,000 – £28,000 / year (Classroom-based Undergraduate) | £15,000 – £32,000 / year (Full 1-Year Master’s Program). Lab and clinical disciplines range higher.',
      livingExpenses: '£1,483 / month for Inner London (~£13,347 / 9-month academic year) | £1,136 / month Outside London (~£10,224 / 9-month academic year) based on UKVI statutory maintenance thresholds.',
      costSource: 'Official UKVI maintenance regulations and British Council Study UK verified fee indicators (2025/2026). Costs vary by university tier and lifestyle.',
      englishRequirements: [
        'IELTS Academic: 6.0 – 7.0 overall (minimum 5.5 – 6.5 per skill component depending on university ranking).',
        'Pearson PTE Academic: 59 – 69 overall score.',
        'Duolingo English Test (DET): 110 – 130 (accepted by an expanding range of UK institutions).',
        'High School English Waiver: Available at select universities for CBSE/ISC Class 12 English scores of 70%+.'
      ],
      scholarships: [
        'Chevening Scholarships (Prestigious UK Government fully funded master’s program).',
        'Commonwealth Scholarships for eligible Commonwealth nation citizens.',
        'GREAT Scholarships (British Council partnership with UK universities, offering £10,000 awards).',
        'University International Merit Awards (Tuition discounts ranging from £2,000 to £8,000 awarded at admission).'
      ],
      officialLinks: [
        { label: 'UCAS Official Admissions Portal', url: 'https://www.ucas.com' },
        { label: 'Study UK (British Council)', url: 'https://study-uk.britishcouncil.org' },
        { label: 'GOV.UK Student Visa Guidance', url: 'https://www.gov.uk/student-visa' }
      ]
    },
    'usa': {
      name: 'United States',
      flag: '🇺🇸',
      badge: 'Global Innovation, Research & 3-Year STEM OPT',
      popularStudyOptions: [
        'Computer Science, Software Engineering & Data Systems',
        'Business Analytics, Finance & STEM-Designated MBA',
        'Electrical, Mechanical & Robotics Engineering',
        'Biotechnology, Pre-Medicine & Health Sciences',
        'Economics, Public Policy & International Relations',
        'Design, Human-Computer Interaction & Digital Media'
      ],
      admissionRequirements: [
        'Undergraduate: Secondary School completion with competitive GPA (3.0+ unweighted); holistic evaluation including extracurricular engagement, personal statement, and recommendation letters. SAT/ACT optional at many universities.',
        'Postgraduate: 4-Year Bachelor’s degree (or 3-year degree with certified WES credential evaluation); minimum GPA 3.0/4.0.',
        'Standardized Tests: GRE or GMAT required for select competitive master’s and MBA programs (waivers available based on GPA or experience).'
      ],
      tuitionExpenses: '$22,000 – $48,000 / year (Public Out-of-State / Private Colleges) | $25,000 – $52,000 / year (Master’s & STEM degrees). Elite private research universities may exceed $58,000.',
      livingExpenses: '$14,000 – $22,000 / academic year (encompassing on-campus room and board, mandatory health insurance, and books). Varies markedly between metropolitan and regional states.',
      costSource: 'College Board Trends in Higher Education & EducationUSA Published Institutional Budgets (2025/2026).',
      englishRequirements: [
        'TOEFL iBT: 80 – 100+ overall score.',
        'IELTS Academic: 6.5 – 7.5 overall band score.',
        'Duolingo English Test (DET): 115 – 130 accepted across more than 4,000 US colleges.'
      ],
      scholarships: [
        'Institutional Merit Scholarships ($5,000 to full-tuition waivers awarded based on high academic standing).',
        'Graduate Assistantships (Teaching & Research Assistantships with full tuition remission and living stipends).',
        'Fulbright Foreign Student Program for master’s and doctoral scholars.',
        'Athletic and Talent-Based Institutional Grants for qualified applicants.'
      ],
      officialLinks: [
        { label: 'EducationUSA (U.S. Department of State)', url: 'https://educationusa.state.gov' },
        { label: 'Study in the States (U.S. Dept of Homeland Security)', url: 'https://studyinthestates.dhs.gov' },
        { label: 'Common Application Portal', url: 'https://www.commonapp.org' }
      ]
    },
    'canada': {
      name: 'Canada',
      flag: '🇨🇦',
      badge: 'Welcoming Campuses, Co-op Programs & PGWP',
      popularStudyOptions: [
        'Computer Science, Applied AI & Cloud Computing',
        'Business Administration, Management & Supply Chain',
        'Civil, Mechanical & Sustainable Energy Engineering',
        'Healthcare Administration, Nursing & Public Health',
        'Information Technology & Business Systems Analysis',
        'Environmental Science & Natural Resource Management'
      ],
      admissionRequirements: [
        'Undergraduate: High school completion with minimum 70%–85% overall average depending on province and program selectivity.',
        'Postgraduate: 4-Year Bachelor’s degree with minimum B / 3.0 GPA (approx. 73%–77%+) in the final two years of study.',
        'Provincial Attestation Letter (PAL): Mandatory document issued through designated learning institutions (DLIs) under current IRCC study permit regulations.'
      ],
      tuitionExpenses: 'CAD 20,000 – CAD 38,000 / year (Undergraduate programs) | CAD 18,000 – CAD 35,000 / year (Postgraduate degree programs).',
      livingExpenses: 'CAD 20,635 / year (Statutory base financial requirement set by IRCC for single study permit applicants outside Quebec, plus first-year tuition and travel allowance).',
      costSource: 'Statistics Canada International Tuition Survey & Immigration, Refugees and Citizenship Canada (IRCC) statutory guidelines.',
      englishRequirements: [
        'IELTS Academic: 6.5 overall (minimum 6.0 in each individual band).',
        'PTE Academic: 60+ overall score.',
        'TOEFL iBT: 86 – 92 overall.'
      ],
      scholarships: [
        'University Entrance Awards (CAD 2,000 to CAD 20,000 automatic merit scholarships for high-achieving applicants).',
        'Vanier Canada Graduate Scholarships for eligible doctoral candidates.',
        'Provincial Graduate Scholarships (such as Ontario Graduate Scholarship - OGS).',
        'Faculty-specific Research Bursaries for thesis-based Master’s programs.'
      ],
      officialLinks: [
        { label: 'EduCanada (Official Government Portal)', url: 'https://www.educanada.ca' },
        { label: 'IRCC Study Permit Official Guidelines', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html' },
        { label: 'Universities Canada Directory', url: 'https://www.univcan.ca' }
      ]
    },
    'australia': {
      name: 'Australia',
      flag: '🇦🇺',
      badge: 'Group of Eight (Go8) Research Excellence & High Quality of Life',
      popularStudyOptions: [
        'Information Technology, Cybersecurity & Network Systems',
        'Mining, Civil, Renewable & Electrical Engineering',
        'Professional Accounting, International Business & Commerce',
        'Nursing, Biomedical Sciences & Public Health',
        'Data Science & Artificial Intelligence',
        'Environmental Management & Marine Biology'
      ],
      admissionRequirements: [
        'Undergraduate: Australian Year 12 equivalent with ATAR equivalent benchmarks or 65%–85% in certified national senior secondary boards.',
        'Postgraduate: Recognized Bachelor’s degree with satisfactory GPA (typically 60%–65%+ minimum depending on Go8 vs. ATN university membership).',
        'Genuine Student (GS) Requirement: Thorough assessment of candidate academic intentions, course relevance, and economic profile.'
      ],
      tuitionExpenses: 'AUD 24,000 – AUD 44,000 / year (Undergraduate courses) | AUD 26,000 – AUD 46,000 / year (Postgraduate courses). Specialized medicine and dentistry range higher.',
      livingExpenses: 'AUD 29,710 / year (Department of Home Affairs statutory financial capacity threshold for student visa Subclass 500 primary applicants).',
      costSource: 'Australian Government Study Australia & Department of Home Affairs (Subclass 500) official evidentiary thresholds.',
      englishRequirements: [
        'IELTS Academic: 6.5 overall band (no sub-band score under 6.0).',
        'PTE Academic: 58 – 65 overall score.',
        'TOEFL iBT: 79 – 90 overall score.'
      ],
      scholarships: [
        'Australia Awards Scholarships (Australian Government bilateral development program).',
        'Destination Australia Scholarships (up to AUD 15,000 / year supporting regional study).',
        'Vice-Chancellor’s International Excellence Awards (20% to 50% tuition fee reductions at select universities).',
        'Go8 Faculty Merit Bursaries for high-performing graduate students.'
      ],
      officialLinks: [
        { label: 'Study Australia (Official Government Gateway)', url: 'https://www.studyaustralia.gov.au' },
        { label: 'Department of Home Affairs Student Visa (Subclass 500)', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500' },
        { label: 'QILT Quality Indicators for Learning & Teaching', url: 'https://www.qilt.edu.au' }
      ]
    },
    'germany': {
      name: 'Germany and Europe',
      flag: '🇩🇪',
      badge: 'Engineering Excellence & Low Public University Tuition',
      popularStudyOptions: [
        'Automotive, Mechanical & Mechatronics Engineering',
        'Computer Science, Autonomous Systems & Robotics',
        'Renewable Energy Engineering & Sustainable Technologies',
        'International Management, Supply Chain & Logistics',
        'Applied Data Science & Industrial Mathematics',
        'Molecular Biology, Chemistry & Materials Science'
      ],
      admissionRequirements: [
        'Undergraduate: Secondary school qualification evaluated via Anabin database. Depending on curriculum, students may require 1 year of Studienkolleg (Foundation Course) + Feststellungsprüfung (FSP).',
        'Postgraduate: Consecutive Bachelor’s degree strictly matching the target master’s curriculum (ECTS subject credit match is strictly evaluated).',
        'APS Certificate: Required for applicants from select Asian jurisdictions prior to visa processing.'
      ],
      tuitionExpenses: '€0 / semester tuition at most public universities (statutory semester contribution of €150 – €350 applies, covering public transit). Note: Non-EU tuition fee of ~€1,500/semester applies in Baden-Württemberg and select Bavarian public institutions | €9,000 – €16,000 / year at accredited private business schools.',
      livingExpenses: '€11,904 / year (€992 / month required proof in a statutory Blocked Account - Sperrkonto for German National Student Visa approval).',
      costSource: 'DAAD (German Academic Exchange Service) & German Federal Foreign Office statutory blocked account requirements (2025/2026).',
      englishRequirements: [
        'English-Taught Programs: IELTS Academic 6.5+ or TOEFL iBT 85–92+.',
        'German-Taught Programs: TestDaF (level 4 across all components) or Goethe-Zertifikat C1.',
        'Bilingual Tracks: Minimum B2 German + B2/C1 English.'
      ],
      scholarships: [
        'DAAD Scholarships (German Academic Exchange Service providing comprehensive monthly stipends for Master’s & PhD candidates).',
        'Deutschlandstipendium (€300 / month national merit scholarship supported jointly by federal funds and private sponsors).',
        'Erasmus+ mobility grants for intra-European academic exchanges.'
      ],
      officialLinks: [
        { label: 'DAAD International Programmes Portal', url: 'https://www.daad.de/en/' },
        { label: 'Study in Germany (Federal Ministry of Education)', url: 'https://www.study-in-germany.de/en/' },
        { label: 'German Federal Foreign Office Visa Service', url: 'https://www.auswaertiges-amt.de/en/visa-service' }
      ]
    },
    'uae': {
      name: 'United Arab Emirates',
      flag: '🇦🇪',
      badge: 'GCC Regional Education Hub & Prestigious International Branch Campuses',
      popularStudyOptions: [
        'Artificial Intelligence, Cloud Computing & Cybersecurity',
        'International Business, Banking, FinTech & Marketing',
        'Architecture, Interior Design & Sustainable Civil Engineering',
        'Hospitality, Event Management & Tourism Operations',
        'Media, Digital Communications & Creative Industries',
        'Aviation Management & Aerospace Logistics'
      ],
      admissionRequirements: [
        'Undergraduate: Recognized 12th Grade / Secondary School Diploma with minimum 70%–80% overall score (varies by university); EmSAT exams or university entrance diagnostic for select majors.',
        'Postgraduate: Bachelor’s degree recognized by UAE Ministry of Education (CAA accredited) with minimum cumulative GPA of 2.5 – 3.0 / 4.0.',
        'Equivalency: Educational certificate equivalency from the UAE Ministry of Education (MOE) following standard attestation.'
      ],
      tuitionExpenses: 'AED 40,000 – AED 90,000 / year (~$10,800 – $24,500) for Undergraduate degrees | AED 50,000 – AED 110,000 / year (~$13,600 – $30,000) for Master’s degrees. Branch campuses of top UK/Australian universities offer home-country degrees locally.',
      livingExpenses: 'AED 28,000 – AED 48,000 / year (~$7,600 – $13,000) covering university residence or shared private accommodation, transportation, and living expenses.',
      costSource: 'KHDA (Knowledge and Human Development Authority Dubai) & UAE Ministry of Education university directory verified benchmarks.',
      englishRequirements: [
        'IELTS Academic: 6.0 – 6.5 overall band score.',
        'EmSAT Achieve English: 1400 – 1550 score.',
        'TOEFL iBT: 79 – 88 overall score.'
      ],
      scholarships: [
        'University Academic Merit Scholarships (10% to 50% tuition reduction awarded based on high school or bachelor GPA).',
        'Corporate & Community Sponsorships for local and regional applicants.',
        'UAE Golden Visa eligibility for outstanding university graduates graduating with cumulative GPA 3.8+.'
      ],
      officialLinks: [
        { label: 'UAE Ministry of Education (Higher Education)', url: 'https://www.moe.gov.ae' },
        { label: 'KHDA Higher Education Directory', url: 'https://www.khda.gov.ae' },
        { label: 'Commission for Academic Accreditation (CAA)', url: 'https://www.caa.ae' }
      ]
    }
  };

  const currentDestination = studyDestinations[selectedDestinationKey] || studyDestinations['uk'];

  // Handle clicking "Enquire About This Destination"
  const handleEnquireDestination = (destName) => {
    trackCtaClick(`Enquire Destination: ${destName}`, 'destination_explorer', 'intl-consult');
    setFormPreselectedDestination(destName);
    const formElement = document.getElementById('strategic-consultation-booking');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Section 5: International Consulting Process (5 Steps)
  const processSteps = [
    {
      step: '01',
      title: 'Initial Discovery & Credential Review',
      desc: 'Our senior advisors review your academic transcripts, test scorecards, extracurricular portfolio, and career objectives during a focused diagnostic session.'
    },
    {
      step: '02',
      title: 'University Shortlisting & Destination Planning',
      desc: 'We construct a customized shortlist of target universities across eligible destinations, categorized into Aspirational (Reach), Target, and Safe institutions.'
    },
    {
      step: '03',
      title: 'Financial Planning & Scholarship Research',
      desc: 'Our advisors calculate transparent multi-year educational budgets, identify relevant institutional merit scholarships, and clarify statutory proof-of-funds rules.'
    },
    {
      step: '04',
      title: 'Application Preparation & Submission Guidance',
      desc: 'We provide structured reviews of your Statement of Purpose (SOP), resume, recommendation letters, and portal submission timelines to ensure compliance.'
    },
    {
      step: '05',
      title: 'Offer Evaluation & Pre-Departure Preparation',
      desc: 'We assist you in evaluating conditional and unconditional admission offers, verifying student visa checklists, and preparing for your transition abroad.'
    }
  ];

  // Section 7: Recommended Consultation Preparation Documents
  const preparationDocs = [
    {
      title: 'Academic Transcripts and Marksheets',
      desc: 'Complete semester-wise mark sheets and certificates (10th/12th grade for undergraduate applicants; bachelor’s degree transcripts for postgraduate applicants).'
    },
    {
      title: 'Valid Passport',
      desc: 'A clear copy of your valid international passport information page, ideally with at least 12–18 months validity remaining before your target intake.'
    },
    {
      title: 'English Language Test Scores, if available',
      desc: 'Scorecards for IELTS Academic, TOEFL iBT, Pearson PTE Academic, or Duolingo English Test (DET) if already taken.'
    },
    {
      title: 'Statement of Purpose, if available',
      desc: 'An initial draft or outline describing your academic interests, motivation for the chosen field of study, and future career objectives.'
    },
    {
      title: 'Curriculum Vitae or Academic Resume, where applicable',
      desc: 'A chronological summary of your educational history, internships, technical projects, co-curricular achievements, and leadership engagements.'
    },
    {
      title: 'Letters of Recommendation, where applicable',
      desc: 'Contact information or draft recommendation letters from academic professors, teachers, or professional employers where relevant.'
    }
  ];

  // Section 8: Who We Advise (4 Audience Cards)
  const audienceCards = [
    {
      title: 'High School Seniors and Parents',
      badge: 'Undergraduate Pathways',
      desc: 'Guiding students completing IB, CBSE, Cambridge A-Levels, or American curricula to select the right international undergraduate degrees, navigate prerequisite requirements, and establish family budget clarity.',
      icon: Users
    },
    {
      title: 'Undergraduate Applicants',
      badge: 'Bachelor’s Degrees Abroad',
      desc: 'Supporting students seeking direct university admissions, foundational pathways, or international campus transfers across top global university hubs with structured shortlisting.',
      icon: GraduationCap
    },
    {
      title: 'Master’s and Postgraduate Applicants',
      badge: 'Advanced Academic Tracks',
      desc: 'Advising bachelor’s degree holders on 1-year and 2-year specialized Master’s (MSc, MA, LLM) and research programs that maximize career growth, research opportunities, and post-study work options.',
      icon: BookOpen
    },
    {
      title: 'Working Professionals and Executive MBA Applicants',
      badge: 'Leadership & Executive Studies',
      desc: 'Helping mid-career professionals and managers transition into prestigious international Executive MBA, specialized management diplomas, and global leadership programs tailored to career advancement.',
      icon: Briefcase
    }
  ];

  // Section: FAQs
  const faqs = [
    {
      q: 'What makes The Revival International’s consulting different from educational agency recruiters?',
      a: 'We operate as an independent strategic advisory firm focused on student-first outcomes. Unlike commission-only sales agents who steer applicants to specific institutions, our advisors evaluate student profiles objectively against global accreditation standards, verified entry requirements, and real tuition/living cost data across multiple countries.'
    },
    {
      q: 'When should a student begin the international consulting process?',
      a: 'The recommended timeframe is 9 to 12 months prior to your intended intake. This window ensures adequate preparation for standardized English tests, profile enhancement, competitive institutional scholarship deadlines, and thorough visa document preparation.'
    },
    {
      q: 'How does The Revival International assist with scholarships and financial planning?',
      a: 'Our advisors identify destination-specific institutional merit scholarships, regional bursaries, and faculty awards. We help students understand eligibility requirements, essay prompts, and application deadlines, as well as prepare transparent multi-year cost estimates.'
    },
    {
      q: 'Does The Revival International guarantee university admission or student visa approval?',
      a: 'No. As an ethical and compliant advisory organization, we do not promise or guarantee university admission offers, scholarships, visa approvals, or employment. Admission decisions rest entirely with university admissions committees, and visa decisions remain the exclusive legal jurisdiction of destination immigration authorities.'
    },
    {
      q: 'Can consultations be conducted online or in-person?',
      a: 'We offer flexible virtual consultations via secure video conferencing (Google Meet / Zoom), direct phone calls, and WhatsApp for students and parents worldwide, as well as structured in-person advisory sessions by prior appointment.'
    }
  ];

  // Related Services
  const relatedServices = [
    {
      id: 'school-career',
      title: 'School Student Career Guidance',
      badge: 'Foundation',
      desc: 'Comprehensive psychometric evaluation and career stream selection for secondary and high school students.',
      path: 'education-school-career'
    },
    {
      id: 'college-admission',
      title: 'College Admission Assistance',
      badge: 'Execution',
      desc: 'Direct portal application preparation, document dossier auditing, and offer tracking across institutions.',
      path: 'education-college-admission'
    },
    {
      id: 'executive-edu',
      title: 'Executive Education & Seminars',
      badge: 'Leadership',
      desc: 'High-impact executive training modules, corporate governance programs, and professional masterclasses.',
      path: 'education-executive-edu'
    },
    {
      id: 'language-training',
      title: 'Language Training & Test Prep',
      badge: 'Test Prep',
      desc: 'Specialized diagnostic prep for IELTS Academic, Pearson PTE, Duolingo English Test, and business communication.',
      path: 'education-language-training'
    }
  ];

  // Schema.org Structured Data
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'International Consulting & Global Education Advisory',
      'serviceType': 'Higher Education Advisory and Destination Planning',
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'The Revival International Academic Advisory',
        'url': 'https://www.revivalinternational.com/international-consulting',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Dubai',
          'addressRegion': 'Dubai',
          'addressCountry': 'AE'
        }
      },
      'description': 'Navigate international education opportunities with personalized guidance on university selection, admission requirements, tuition fees, living expenses, scholarships, English language requirements, and post-study opportunities.',
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
        title="International Consulting | Strategic Global Education Advisory"
        description="Navigate international education opportunities with personalized guidance on university selection, admission requirements, tuition fees, living expenses, scholarships, English language requirements, and post-study opportunities."
        canonicalPath="international-consulting"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Academic Advisory', item: '/education' },
          { name: 'International Consulting', item: '/international-consulting' }
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
              International Consulting
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
        {/* SECTION 1: HERO SECTION                                                   */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Subtitle, Description, and CTAs */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-gold-500/30">
                    Strategic Education Advisory
                  </span>
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                    Verified Service • Global Consulting
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white leading-tight">
                  International Consulting
                </h1>

                <p className="text-base sm:text-lg text-gold-600 dark:text-gold-400 font-serif italic">
                  Strategic Global Education Advisory & Destination Planning
                </p>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Navigate international education opportunities with personalized guidance on university selection, admission requirements, tuition fees, living expenses, scholarships, English language requirements, and post-study opportunities. Our advisors help students and families make informed decisions based on their academic profiles, budgets, and long-term goals.
                </p>

                {/* Two CTA Buttons */}
                <div className="pt-3 flex flex-wrap gap-3.5 items-center">
                  <button
                    onClick={() => {
                      trackCtaClick('Book Free Consultation', 'hero_section', 'intl-consult');
                      scrollToSection('strategic-consultation-booking');
                    }}
                    className="px-6 py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Free Consultation</span>
                  </button>

                  <button
                    onClick={() => {
                      trackCtaClick('Explore Study Destinations', 'hero_section', 'intl-consult');
                      scrollToSection('study-destinations-explorer');
                    }}
                    className="px-5 py-3.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs sm:text-sm rounded-xl transition border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-gold-500" />
                    <span>Explore Study Destinations ↓</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Premium Visual of International Education */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-gold-500/30 group">
                  <img
                    src="/images/international_campus.jpg"
                    alt="International University Students Walking on Prestigious Campus"
                    className="w-full h-72 sm:h-80 md:h-96 object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />
                  
                  {/* Floating Overlay Badges */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md p-3.5 rounded-xl border border-gold-500/30 shadow-lg">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-navy-800">
                        <span className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-gold-500" />
                          Global University Corridors
                        </span>
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded">
                          6 Key Regions
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 font-medium leading-snug">
                        Objective profile diagnostics for the UK, USA, Canada, Australia, Europe & UAE.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 2: KEY INFORMATION SECTION                                        */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Advisory Overview
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Key Consultation Dimensions
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Core parameters evaluated across all international education advisory engagements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {keyInfoBlocks.map((block, idx) => {
                const Icon = block.icon;
                return (
                  <div
                    key={idx}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 hover:border-gold-500 transition duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        {block.label}
                      </p>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-navy-900 dark:text-white leading-snug pt-1">
                        {block.value}
                      </h3>
                      <p className="text-[11px] text-gold-600 dark:text-gold-400 font-medium pt-1">
                        {block.subtext}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 3: FOUR PILLARS OF INTERNATIONAL CONSULTING                       */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Strategic Framework
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Four Pillars of International Consulting
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                A rigorous, multi-faceted advisory methodology delivering structured guidance from credential diagnostics to pre-departure planning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fourPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.id}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 sm:p-7 space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="w-11 h-11 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-navy-950 px-2.5 py-1 rounded-md">
                          Pillar {pillar.id}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white">
                        {pillar.title}
                      </h3>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {pillar.desc}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Key Deliverables:
                        </p>
                        <ul className="space-y-1.5">
                          {pillar.deliverables.map((deliv, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                              <span>{deliv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compliance & Regulatory Disclaimer Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold uppercase tracking-wider text-[11px]">Ethical Advisory & Regulatory Notice</p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  The Revival International provides independent educational profile analysis, destination comparison, and strategic planning. We do not promise, guarantee, or claim to secure university admission offers, visa approvals, scholarships, or employment outcomes. Admission criteria are decided solely by respective universities, and visa decisions remain under the exclusive sovereign authority of foreign immigration departments.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 4: INTERACTIVE STUDY DESTINATION EXPLORER                         */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div id="study-destinations-explorer" className="space-y-8 scroll-mt-24">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Destination Intelligence
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Interactive Study Destination Explorer
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Compare verified admissions requirements, verified fee and living expense estimates, language benchmarks, and official university portals across leading global study destinations.
              </p>
            </div>

            {/* Destination Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 max-w-4xl mx-auto">
              {[
                { key: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
                { key: 'usa', label: 'United States', flag: '🇺🇸' },
                { key: 'canada', label: 'Canada', flag: '🇨🇦' },
                { key: 'australia', label: 'Australia', flag: '🇦🇺' },
                { key: 'germany', label: 'Germany and Europe', flag: '🇩🇪' },
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

            {/* Destination Details Display Card */}
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-luxury transition-all duration-300">
              
              {/* Country Banner */}
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
                  <span>Enquire About {currentDestination.name}</span>
                </button>
              </div>

              {/* 2-Column Responsive Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Column 1: Popular Study Options & General Admission Requirements */}
                <div className="space-y-6">
                  {/* Popular Study Options */}
                  <div className="space-y-3">
                    <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gold-500" />
                      <span>Popular Study Options</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentDestination.popularStudyOptions.map((opt, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* General Admission Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gold-500" />
                      <span>General Admission Requirements</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentDestination.admissionRequirements.map((req, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* English Language Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-gold-500" />
                      <span>English Language Requirements</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {currentDestination.englishRequirements.map((lang, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                          <span>{lang}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Column 2: Financial Estimates, Scholarships, and Official Links */}
                <div className="space-y-6">
                  {/* Estimated Tuition and Living Expenses (Strictly verified data with clear labels) */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gold-500" />
                        <span>Estimated Tuition & Living Expenses</span>
                      </h4>
                      <span className="text-[10px] bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded">
                        Verified Estimates
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estimated Annual Tuition</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 pt-0.5">{currentDestination.tuitionExpenses}</p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Estimated Living Expenses</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 pt-0.5">{currentDestination.livingExpenses}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-navy-800 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-bold">Source: </span>
                        <span>{currentDestination.costSource}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scholarship Information */}
                  <div className="space-y-3">
                    <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <span>Scholarship & Bursary Information</span>
                    </h4>
                    <ul className="space-y-2">
                      {currentDestination.scholarships.map((sch, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{sch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Relevant Official University and Government Links */}
                  <div className="space-y-2.5 pt-2">
                    <h4 className="font-serif text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Official Government & Admissions Portals
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
                  Need destination comparison or program matching for {currentDestination.name}? Schedule a one-on-one discovery session.
                </p>
                <button
                  onClick={() => handleEnquireDestination(currentDestination.name)}
                  className="w-full sm:w-auto px-6 py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enquire About This Destination</span>
                </button>
              </div>

            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 5: INTERNATIONAL CONSULTING PROCESS                               */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Advisory Roadmap
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                International Consulting Process
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                A structured five-stage methodology designed to ensure academic profile fit, financial clarity, and timely application submission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {processSteps.map((step) => (
                <div
                  key={step.step}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 relative hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <span className="w-8 h-8 rounded-full bg-gold-500 text-navy-950 font-extrabold text-xs flex items-center justify-center shadow-gold-glow">
                      {step.step}
                    </span>
                    <h3 className="font-serif text-sm font-bold text-navy-900 dark:text-white leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-400 font-mono uppercase tracking-wider border-t border-slate-100 dark:border-navy-800/80">
                    Step {step.step} of 05
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 6: CONSULTATION BOOKING FORM                                      */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div id="strategic-consultation-booking" className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 space-y-6 shadow-luxury scroll-mt-24">
            <InternationalConsultingForm
              embedded={true}
              preselectedDestination={formPreselectedDestination}
              onDestinationChange={(newDest) => {
                // Keep selector in sync if matched
                const matchedKey = Object.keys(studyDestinations).find(
                  k => studyDestinations[k].name.toLowerCase() === newDest.toLowerCase()
                );
                if (matchedKey) setSelectedDestinationKey(matchedKey);
              }}
            />
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 7: RECOMMENDED CONSULTATION PREPARATION DOCUMENTS                 */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 space-y-6 shadow-glass">
            <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 pb-2 border-b border-slate-100 dark:border-navy-800">
              <FileCheck className="w-6 h-6" />
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  Recommended Consultation Preparation Documents
                </h2>
                <p className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-bold tracking-widest">
                  Candidate Diagnostic Dossier
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              To maximize the value of your strategic consultation, we recommend preparing the following documents if available. These allow our advisors to evaluate grade benchmarks, course prerequisite coverage, and scholarship eligibility:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {preparationDocs.map((doc, idx) => (
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
              <span className="font-bold text-slate-800 dark:text-slate-200">Institutional Variance Notice: </span>
              <span>
                Please note that specific document requirements vary by institution, degree level, and destination country. Our advisors will provide a destination-specific document checklist following your initial evaluation.
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 8: WHO WE ADVISE                                                  */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Candidate Profiles
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Who We Advise
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Tailored educational advisory programs aligned to candidate academic milestones and professional ambitions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {audienceCards.map((aud, idx) => {
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
                        onClick={() => {
                          scrollToSection('strategic-consultation-booking');
                        }}
                        className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Schedule Advisory Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* FREQUENTLY ASKED QUESTIONS ACCORDION                                      */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Common Inquiries
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
        {/* RELATED EDUCATIONAL SERVICES                                              */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedServices.map((rel) => (
                <div
                  key={rel.id}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {rel.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">#{rel.id}</span>
                    </div>
                    <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {rel.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
                    <button
                      onClick={() => navigateTo(rel.path)}
                      className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore Service</span>
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

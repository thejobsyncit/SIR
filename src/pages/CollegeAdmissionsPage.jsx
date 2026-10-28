import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import ScrollReveal from '../components/ScrollReveal';
import { CollegeAdmissionsForm } from '../components/CollegeAdmissionsForm';
import { trackServiceView, trackCtaClick } from '../services/analytics';
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
  HelpCircle, FileText, Users, Compass, Globe, Sparkles, Building2,
  Phone, Mail, Calendar, ShieldCheck, Award, GraduationCap, School,
  ClipboardCheck, Clock, BookOpen, CheckSquare, AlertCircle, Layers, Search
} from 'lucide-react';

export const CollegeAdmissionsPage = () => {
  const { navigateTo } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [prefillData, setPrefillData] = useState(null);

  // Interactive Eligibility Assessment State (Phase 3)
  const [eligibilityInput, setEligibilityInput] = useState({
    currentQualification: 'Class 12 / Higher Secondary (Completed or Appearing)',
    academicResults: '',
    preferredCourse: '',
    preferredDestination: 'India (Premier Colleges & Universities)'
  });
  const [eligibilityFeedback, setEligibilityFeedback] = useState(null);

  // Interactive Document Checklist Filter & Check State (Phase 5)
  const [docCourseFilter, setDocCourseFilter] = useState('all');
  const [docDestinationFilter, setDocDestinationFilter] = useState('all');
  const [checkedDocs, setCheckedDocs] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    trackServiceView('college-adm', 'College Admission Assistance', 'Admissions');
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Phase 1: Four Key Hero Information Blocks
  const heroInfoBlocks = [
    {
      label: 'Degrees',
      value: 'UG, PG, B.Sc., B.A., B.E., and other applicable programs',
      icon: GraduationCap
    },
    {
      label: 'Support Scope',
      value: 'End-to-End Application Assistance',
      icon: Layers
    },
    {
      label: 'Application Support',
      value: 'Direct Portal Guidance',
      icon: Compass
    },
    {
      label: 'Offer Tracking',
      value: 'Conditional Offer Follow-up',
      icon: ClipboardCheck
    }
  ];

  // Phase 2: Six College Admission Service Cards
  const admissionServices = [
    {
      id: 'course-college-selection',
      number: '01',
      title: 'Course and College Selection',
      badge: 'Academic Alignment',
      icon: Compass,
      description: 'Structured shortlisting of courses, degree specializations, and accredited institutions tailored to your academic background.',
      points: [
        'Understand the student’s interests, qualifications, and academic goals.',
        'Explore suitable courses, colleges, and universities.',
        'Compare available programs and entry requirements.',
        'Provide guidance for selecting suitable options.'
      ],
      actionLabel: 'Enquire About Course Selection'
    },
    {
      id: 'eligibility-assessment',
      number: '02',
      title: 'Eligibility Assessment',
      badge: 'Criteria Review',
      icon: ClipboardCheck,
      description: 'Objective review of your marksheets, subjects, and grades against official institutional entry requirements.',
      points: [
        'Review the student’s current qualification and academic results.',
        'Identify relevant course entry requirements.',
        'Explain prerequisite subjects and minimum criteria where verified.',
        'Highlight any missing information required for assessment.'
      ],
      actionLabel: 'Check Eligibility Requirements'
    },
    {
      id: 'application-preparation',
      number: '03',
      title: 'Application Preparation',
      badge: 'Portal Guidance',
      icon: FileText,
      description: 'Step-by-step guidance through college and university application forms for accurate, complete submissions.',
      points: [
        'Guide students through application forms.',
        'Explain application requirements and submission steps.',
        'Help organize required documents.',
        'Review information for completeness before submission.'
      ],
      actionLabel: 'Start Application Preparation'
    },
    {
      id: 'document-verification-checklist',
      number: '04',
      title: 'Document Verification and Checklist',
      badge: 'Dossier Audit',
      icon: CheckSquare,
      description: 'Course-specific document organization to ensure transcripts, certificates, and IDs are properly prepared.',
      points: [
        'Provide a course-specific document checklist.',
        'Help organize academic transcripts and marksheets.',
        'Identify applicable identification, certificates, and supporting documents.',
        'Track missing documents and pending actions.'
      ],
      actionLabel: 'View Document Checklist',
      targetSection: 'admission-document-checklist'
    },
    {
      id: 'application-deadline-tracking',
      number: '05',
      title: 'Application and Deadline Tracking',
      badge: 'Status Monitoring',
      icon: Clock,
      description: 'Systematic tracking of target colleges, intake cutoffs, submission progress, and pending institutional actions.',
      points: [
        'Record target colleges and application progress.',
        'Track deadlines, submission status, and pending requirements.',
        'Provide reminders for important dates where supported.',
        'Allow students or authorized staff to update application status.'
      ],
      actionLabel: 'Track Application Timeline'
    },
    {
      id: 'offer-letter-enrollment-guidance',
      number: '06',
      title: 'Offer Letter and Enrollment Guidance',
      badge: 'Offer Follow-up',
      icon: Award,
      description: 'Clear explanation of conditional or unconditional offer letters, outstanding conditions, and enrollment steps.',
      points: [
        'Help students understand received offer letters.',
        'Track conditional and unconditional offers where applicable.',
        'Explain outstanding conditions and required next steps.',
        'Provide guidance on acceptance deadlines and enrollment documentation.'
      ],
      actionLabel: 'Get Offer Letter Guidance'
    }
  ];

  // Phase 3: Intended Audience Groups ("Who Can We Help?")
  const studentGroups = [
    {
      title: 'Students completing Class 12 and exploring undergraduate courses.',
      desc: 'Guidance across B.E., B.Tech, B.Sc., B.A., B.Com, BBA, BCA, and allied undergraduate degree streams.',
      badge: 'Undergraduate (UG)'
    },
    {
      title: 'Diploma holders considering eligible degree programs.',
      desc: 'Support for polytechnic and diploma graduates exploring lateral entry or eligible degree progression pathways.',
      badge: 'Diploma to Degree'
    },
    {
      title: 'Students planning postgraduate studies, where applicable.',
      desc: 'Structured admission assistance for graduates applying to M.Sc., M.A., MBA, MCA, M.E./M.Tech, and PG programs.',
      badge: 'Postgraduate (PG)'
    },
    {
      title: 'Students exploring course or college transfers.',
      desc: 'Information on credit evaluation requirements, syllabus comparison, and institutional transfer policies.',
      badge: 'Transfer Guidance'
    },
    {
      title: 'Students who need assistance understanding admission requirements.',
      desc: 'Clear breakdown of subject prerequisites, cutoff criteria, document checklists, and portal timelines.',
      badge: 'Admissions Clarity'
    }
  ];

  // Phase 4: Four-Step Admission Process ("How the Admission Process Works")
  const admissionSteps = [
    {
      step: '01',
      label: 'Step 1 — Initial Consultation',
      title: 'Initial Consultation',
      desc: 'Understand the student’s qualifications, interests, preferred courses, budget, and study destination.'
    },
    {
      step: '02',
      label: 'Step 2 — Course and College Selection',
      title: 'Course and College Selection',
      desc: 'Identify suitable options and explain verified admission requirements.'
    },
    {
      step: '03',
      label: 'Step 3 — Application and Document Submission',
      title: 'Application and Document Submission',
      desc: 'Assist with application preparation, document checklists, and submission guidance.'
    },
    {
      step: '04',
      label: 'Step 4 — Offer and Enrollment Follow-up',
      title: 'Offer and Enrollment Follow-up',
      desc: 'Help track application updates, outstanding conditions, deadlines, and enrollment steps.'
    }
  ];

  // Phase 5: Configurable Documentation Checklist ("Admission Document Checklist")
  const checklistDocuments = [
    {
      id: 'doc-marksheets',
      title: 'Class 10 and Class 12 marksheets, where applicable.',
      applicability: 'Applicable for UG, Diploma & PG verification',
      courses: ['all', 'ug', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Where applicable (Predicted grades or provisional marksheets may be considered for initial conditional review).'
    },
    {
      id: 'doc-diploma-degree',
      title: 'Diploma or degree certificates, where applicable.',
      applicability: 'Applicable for Diploma holders & Postgraduate (PG) applicants',
      courses: ['all', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Where applicable (Provisional certificate or final semester marksheets for graduating students).'
    },
    {
      id: 'doc-transcripts',
      title: 'Academic transcripts.',
      applicability: 'Consolidated or semester-wise official academic records',
      courses: ['all', 'ug', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Commonly requested for credit evaluation, PG admissions, and transfer applications.'
    },
    {
      id: 'doc-id-passport',
      title: 'Government-issued identification or passport, if required.',
      applicability: 'Identity verification for portal registration',
      courses: ['all', 'ug', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'If required (National ID / Aadhaar for domestic colleges; valid Passport for international institutions).'
    },
    {
      id: 'doc-sop',
      title: 'Statement of Purpose (SOP), if required.',
      applicability: 'Personal statement outlining academic goals & course motivation',
      courses: ['all', 'ug', 'pg'],
      destinations: ['all', 'international', 'domestic'],
      requirementNote: 'If required by the selected university or specialized degree program.'
    },
    {
      id: 'doc-lor',
      title: 'Recommendation letters, if required.',
      applicability: 'Academic or faculty reference letters on institutional letterhead',
      courses: ['all', 'ug', 'pg'],
      destinations: ['all', 'international'],
      requirementNote: 'If required (Typically 1 to 2 academic references for select universities and postgraduate tracks).'
    },
    {
      id: 'doc-english',
      title: 'English-language proficiency results, if required.',
      applicability: 'IELTS, TOEFL, PTE, DET, or medium-of-instruction certificate',
      courses: ['all', 'ug', 'pg'],
      destinations: ['all', 'international'],
      requirementNote: 'If required by the destination university or program entry criteria.'
    },
    {
      id: 'doc-additional',
      title: 'Additional documents requested by the selected institution.',
      applicability: 'Transfer certificate, migration certificate, portfolio, or entrance scorecard',
      courses: ['all', 'ug', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Varies by course, college, and admission board regulations.'
    }
  ];

  const filteredDocuments = checklistDocuments.filter(doc => {
    const courseMatch = docCourseFilter === 'all' || doc.courses.includes(docCourseFilter);
    const destMatch = docDestinationFilter === 'all' || doc.destinations.includes(docDestinationFilter);
    return courseMatch && destMatch;
  });

  // Phase 7: 10-Stage Configurable Application Status Workflow
  const workflowStages = [
    { step: 1, name: 'New Enquiry', desc: 'Enquiry logged and linked to College Admission Assistance' },
    { step: 2, name: 'Consultation Scheduled', desc: 'Initial advisor session scheduled with student/parent' },
    { step: 3, name: 'Course Selection', desc: 'Shortlisting suitable courses, colleges, and eligibility criteria' },
    { step: 4, name: 'Documents Pending', desc: 'Collecting and verifying required transcripts & certificates' },
    { step: 5, name: 'Application in Preparation', desc: 'Completing institutional portal forms and dossier review' },
    { step: 6, name: 'Application Submitted', desc: 'Verified submission to selected college/university portal' },
    { step: 7, name: 'Awaiting Institution Decision', desc: 'Monitoring admissions board review and queries' },
    { step: 8, name: 'Offer Received', desc: 'Evaluating conditional or unconditional offer letter terms' },
    { step: 9, name: 'Enrollment in Progress', desc: 'Assisting with condition clearing and enrollment steps' },
    { step: 10, name: 'Closed', desc: 'Admission workflow completed or closed' }
  ];

  // Phase 8: Related Academic Advisory Services (All 5 Existing Services)
  const relatedServices = [
    {
      id: 'intl-adm',
      title: 'International Admissions',
      badge: 'Global Portals',
      desc: 'End-to-end university application coordination across UCAS, Common App, and direct international portals.',
      route: 'education-intl-adm'
    },
    {
      id: 'school-career',
      title: 'School Student Career Guidance',
      badge: 'Stream & Career Mapping',
      desc: 'Scientific aptitude evaluation, stream selection (Grades 8–12), and UG/PG course guidance catalogue.',
      route: 'education-school-career'
    },
    {
      id: 'school-academy',
      title: 'Academy for School Students',
      badge: 'Competitive Exams & Coaching',
      desc: 'Explore 40+ competitive examinations across 11 departments and compare verified coaching academies.',
      route: 'education-school-academy'
    },
    {
      id: 'exec-seminars-lang',
      title: 'Seminars & Language',
      badge: 'Executive & Test Prep',
      desc: 'Executive development seminars and structured language test preparation for IELTS, OET, DET, and TOEFL.',
      route: 'education-exec-seminars-lang'
    },
    {
      id: 'intl-consult',
      title: 'International Consulting',
      badge: 'Destination Strategy',
      desc: 'Strategic global education advisory comparing study destinations, tuition structures, and eligibility.',
      route: 'education-intl-consult'
    }
  ];

  // Phase 9: FAQ Accordion Questions & Verified Answers
  const faqs = [
    {
      q: 'What is included in College Admission Assistance?',
      a: 'College Admission Assistance covers the complete admission journey: understanding your qualifications and goals, exploring suitable courses and colleges, assessing eligibility against verified criteria, guiding you through application forms, providing a tailored document checklist, tracking application deadlines, and helping you understand received offer letters and enrollment steps.'
    },
    {
      q: 'Can you help me choose a suitable course?',
      a: 'Yes. Our advisors review your academic background, subject prerequisites, career interests, and preferred study destination to help you compare suitable undergraduate (B.Sc., B.A., B.E., B.Com, etc.), diploma-to-degree, or postgraduate programs.'
    },
    {
      q: 'Can I apply with predicted grades?',
      a: 'Many colleges and universities allow students currently completing Class 12 or their final degree semester to submit initial applications using school-verified predicted grades or provisional marksheets. Where applicable, institutions may issue a Conditional Offer subject to meeting final exam criteria.'
    },
    {
      q: 'What documents may be required?',
      a: 'Commonly requested documents include Class 10 and Class 12 marksheets, diploma or degree certificates (where applicable), academic transcripts, government-issued ID or passport, and—depending on the institution and course—a Statement of Purpose (SOP), recommendation letters, or English proficiency results. Requirements vary by institution and program.'
    },
    {
      q: 'Can you help with transfer applications?',
      a: 'Yes. For students exploring course or college transfers, we help organize academic transcripts, course syllabi, and supporting documentation required by the receiving institution to evaluate transfer eligibility and credit recognition.'
    },
    {
      q: 'Do you help students track application progress?',
      a: 'Yes. Every enquiry is logged in our admissions workflow system with a unique reference number. Our team tracks target colleges, submission dates, pending documents, institutional deadlines, and conditional offer follow-ups.'
    },
    {
      q: 'Does admission assistance guarantee an offer?',
      a: 'No. The Revival International provides structured guidance, eligibility checks, document verification, and application support, but final admission decisions and offer letters are issued solely at the discretion of the respective educational institution based on their official admission criteria and seat availability.'
    }
  ];

  // Structured Data for SEO (Phase 10)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'College Admission Assistance',
      'serviceType': 'Higher Education & College Admissions Support',
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'The Revival International',
        'url': 'https://www.revivalinternational.com/education/college-admission-assistance'
      },
      'description': 'Navigate your higher education journey with structured college and university admission support. From course selection and eligibility checks to application preparation, document verification, application follow-ups, and offer-letter guidance.'
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

  const handleEligibilitySubmit = (e) => {
    e.preventDefault();
    if (!eligibilityInput.academicResults.trim() || !eligibilityInput.preferredCourse.trim()) {
      setEligibilityFeedback({
        type: 'warning',
        text: 'Please enter your academic results and preferred course so we can prepare your preliminary eligibility assessment.'
      });
      return;
    }

    setEligibilityFeedback({
      type: 'ready',
      text: `Preliminary details captured for ${eligibilityInput.preferredCourse.trim()} (${eligibilityInput.preferredDestination}). Please complete the consultation form below so an advisor can verify your subject prerequisites against official institutional criteria. Final eligibility depends on the relevant institution’s official admission criteria.`
    });

    setPrefillData({
      currentQualification: eligibilityInput.currentQualification,
      academicResults: eligibilityInput.academicResults.trim(),
      preferredCourse: eligibilityInput.preferredCourse.trim(),
      preferredDestination: eligibilityInput.preferredDestination,
      additionalQuestions: `Requesting Eligibility Assessment for ${eligibilityInput.preferredCourse.trim()} in ${eligibilityInput.preferredDestination} with qualification: ${eligibilityInput.currentQualification} (${eligibilityInput.academicResults.trim()}).`
    });

    setTimeout(() => {
      scrollToSection('college-admission-consultation');
    }, 250);
  };

  const handleServiceCardAction = (service) => {
    trackCtaClick(service.title, 'college_admission_services', 'college-adm');
    if (service.targetSection) {
      scrollToSection(service.targetSection);
      return;
    }
    setPrefillData(prev => ({
      ...(prev || {}),
      additionalQuestions: `Enquiring specifically about: ${service.title} — ${service.description}`
    }));
    scrollToSection('college-admission-consultation');
  };

  const toggleDocCheck = (id) => {
    setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-16 pb-24 text-slate-800 dark:text-slate-200">
      <EducationSEO
        title="College Admission Assistance | The Revival International"
        description="Navigate your higher education journey with structured college and university admission support. Course selection, eligibility checks, application preparation, document verification, and offer-letter guidance."
        canonicalPath="education/college-admission-assistance"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Academic Advisory', item: '/education' },
          { name: 'College Admission Assistance', item: '/education/college-admission-assistance' }
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
              College Admission Assistance
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
        {/* PHASE 1: PREMIUM HERO SECTION                                             */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Subtitle, Description, CTAs */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-gold-500/30">
                    Higher Education Advisory
                  </span>
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                    Verified Service • Admissions
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white leading-tight">
                  College Admission Assistance
                </h1>

                <p className="text-base sm:text-lg text-gold-600 dark:text-gold-400 font-serif italic">
                  End-to-End Higher Education &amp; College Admissions Support
                </p>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Navigate your higher education journey with structured college and university admission support. From course selection and eligibility checks to application preparation, document verification, application follow-ups, and offer-letter guidance, The Revival International helps students understand and manage their admission process with greater clarity and confidence.
                </p>

                {/* Two Functional CTA Buttons */}
                <div className="pt-3 flex flex-wrap gap-3.5 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      trackCtaClick('Book Free Consultation', 'hero_section', 'college-adm');
                      scrollToSection('college-admission-consultation');
                    }}
                    className="px-6 py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Free Consultation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      trackCtaClick('Explore Admission Process', 'hero_section', 'college-adm');
                      scrollToSection('admission-process-section');
                    }}
                    className="px-5 py-3.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs sm:text-sm rounded-xl transition border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-gold-500" />
                    <span>Explore Admission Process ↓</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Premium Visual Card (matching International Consulting) */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-gold-500/30 group">
                  <img
                    src="/images/international_admissions.jpg"
                    alt="Students Reviewing College Admission Applications and University Course Options"
                    className="w-full h-72 sm:h-80 md:h-96 object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />

                  {/* Floating Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md p-3.5 rounded-xl border border-gold-500/30 shadow-lg">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-navy-800">
                        <span className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-gold-500" />
                          Structured Admissions Desk
                        </span>
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded">
                          UG • PG • Diploma
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 font-medium leading-snug">
                        Course matching, document checklists, portal guidance, and conditional offer follow-up.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Four Key Information Blocks */}
            <div className="pt-8 mt-8 border-t border-slate-100 dark:border-navy-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {heroInfoBlocks.map((block, idx) => {
                const Icon = block.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400">
                      <Icon className="w-4 h-4 shrink-0" />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{block.label}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white leading-snug">{block.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* PHASE 2: COLLEGE ADMISSION SERVICES (6 SERVICE CARDS)                     */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section aria-labelledby="admission-services-heading" className="space-y-8">
            <div className="text-center space-y-2 max-w-3xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Structured Support Scope
              </span>
              <h2 id="admission-services-heading" className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-900 dark:text-white">
                Your Complete College Admission Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                Six core admission support modules designed to guide students and parents from initial course exploration to enrollment readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {admissionServices.map((srv) => {
                const Icon = srv.icon;
                return (
                  <div
                    key={srv.id}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {srv.badge}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold text-gold-600 dark:text-gold-400 uppercase">
                          Module {srv.number}
                        </span>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-navy-900 dark:text-white mt-0.5">
                          {srv.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {srv.description}
                      </p>

                      <ul className="space-y-2 pt-1">
                        {srv.points.map((pt, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
                      <button
                        type="button"
                        onClick={() => handleServiceCardAction(srv)}
                        className="w-full py-2.5 px-4 bg-slate-50 hover:bg-gold-500 dark:bg-navy-950 dark:hover:bg-gold-500 text-navy-900 hover:text-navy-950 dark:text-white dark:hover:text-navy-950 font-bold text-xs rounded-xl border border-slate-200 dark:border-navy-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{srv.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* PHASE 3: INTENDED AUDIENCE & ELIGIBILITY ("WHO CAN WE HELP?")             */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section aria-labelledby="who-can-we-help-heading" className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 space-y-8 shadow-luxury">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: 5 Student Groups */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Intended Audience &amp; Eligibility
                  </span>
                  <h2 id="who-can-we-help-heading" className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                    Who Can We Help?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    We support students and families across distinct stages of higher education planning, subject to each institution’s official entry standards.
                  </p>
                </div>

                <div className="space-y-3">
                  {studentGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-start gap-3.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                            {group.title}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold-500/15 text-gold-600 dark:text-gold-400">
                            {group.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {group.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Interactive Eligibility Assessment CTA */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-gold-500/30 rounded-2xl p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gold-600 dark:text-gold-400 flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    Interactive Eligibility Check
                  </span>
                  <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                    Request an Eligibility Assessment
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Share your academic profile below to initiate a structured eligibility check for your target course.
                  </p>
                </div>

                <form onSubmit={handleEligibilitySubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="elig-qual" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Qualification
                    </label>
                    <select
                      id="elig-qual"
                      value={eligibilityInput.currentQualification}
                      onChange={(e) => setEligibilityInput(prev => ({ ...prev, currentQualification: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="Class 12 / Higher Secondary (Completed or Appearing)">Class 12 / Higher Secondary</option>
                      <option value="Polytechnic / 3-Year Diploma Holder (Lateral / Degree Entry)">Diploma Holder (3-Year / Polytechnic)</option>
                      <option value="Bachelor’s Degree Completed or Final Year (Planning PG)">Bachelor’s Degree (Planning PG)</option>
                      <option value="Undergraduate Student (Exploring Course / College Transfer)">Current UG Student (Transfer)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="elig-results" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Results (Percentage / CGPA / Subjects)
                    </label>
                    <input
                      id="elig-results"
                      type="text"
                      value={eligibilityInput.academicResults}
                      onChange={(e) => setEligibilityInput(prev => ({ ...prev, academicResults: e.target.value }))}
                      placeholder="e.g. 84% in Class 12 PCM or 7.9 CGPA"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="elig-course" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Course
                    </label>
                    <input
                      id="elig-course"
                      type="text"
                      value={eligibilityInput.preferredCourse}
                      onChange={(e) => setEligibilityInput(prev => ({ ...prev, preferredCourse: e.target.value }))}
                      placeholder="e.g. B.E. CSE, B.Sc. Biotechnology, B.A., MBA"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="elig-dest" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Study Destination
                    </label>
                    <select
                      id="elig-dest"
                      value={eligibilityInput.preferredDestination}
                      onChange={(e) => setEligibilityInput(prev => ({ ...prev, preferredDestination: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    >
                      <option value="India (Premier Colleges & Universities)">India (Premier Colleges & Universities)</option>
                      <option value="United Arab Emirates (Dubai / Abu Dhabi Campuses)">United Arab Emirates (UAE)</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany & Europe">Germany & Europe</option>
                      <option value="Open to Multiple Study Destinations">Open to Multiple Destinations</option>
                    </select>
                  </div>

                  {eligibilityFeedback && (
                    <div
                      role="status"
                      className={`p-3 rounded-xl text-[11px] leading-relaxed border ${
                        eligibilityFeedback.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {eligibilityFeedback.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Eligibility Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Important Eligibility Policy:</strong> Not every student is automatically eligible for every course. Final eligibility depends on the relevant institution’s official admission criteria, prerequisite subjects, and regulatory norms.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* PHASE 4: ADMISSION PROCESS ("HOW THE ADMISSION PROCESS WORKS")            */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section id="admission-process-section" aria-labelledby="admission-process-heading" className="space-y-8 scroll-mt-24">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                4-Step Execution Timeline
              </span>
              <h2 id="admission-process-heading" className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-900 dark:text-white">
                How the Admission Process Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                A transparent four-step workflow designed to keep students and parents informed from initial consultation through enrollment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {admissionSteps.map((item) => (
                <div
                  key={item.step}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 space-y-4 relative hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-xl bg-gold-500 text-navy-950 font-black text-xs flex items-center justify-center shadow-gold-glow">
                        {item.step}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Stage {item.step} of 04
                      </span>
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-navy-900 dark:text-white">
                      {item.label}
                    </h3>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px] text-gold-600 dark:text-gold-400 font-bold">
                    <span>Verified Milestone</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* PHASE 5: DOCUMENTATION CHECKLIST ("ADMISSION DOCUMENT CHECKLIST")         */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section id="admission-document-checklist" aria-labelledby="doc-checklist-heading" className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 space-y-6 shadow-luxury scroll-mt-24">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-navy-800">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-black tracking-widest">
                    Configurable Requirements By Course &amp; Destination
                  </span>
                  <h2 id="doc-checklist-heading" className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                    Admission Document Checklist
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Filter commonly requested documents below by program level or destination, and check off items you already have ready.
                  </p>
                </div>
              </div>

              {/* Interactive Course & Destination Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  aria-label="Filter checklist by course level"
                  value={docCourseFilter}
                  onChange={(e) => setDocCourseFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="all">All Program Levels</option>
                  <option value="ug">Undergraduate (Class 12 → UG)</option>
                  <option value="diploma">Diploma / Transfer Entry</option>
                  <option value="pg">Postgraduate (Bachelor’s → PG)</option>
                </select>

                <select
                  aria-label="Filter checklist by study destination"
                  value={docDestinationFilter}
                  onChange={(e) => setDocDestinationFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="all">All Study Destinations</option>
                  <option value="domestic">India &amp; Regional Campuses</option>
                  <option value="international">International Universities</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map((doc) => {
                const isChecked = !!checkedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDocCheck(doc.id)}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDocCheck(doc.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-emerald-500/5 border-emerald-500/40 dark:bg-emerald-500/10'
                        : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 hover:border-gold-500/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                      isChecked
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900'
                    }`}>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-1 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-gold-600 dark:text-gold-400 font-semibold">
                        {doc.applicability}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {doc.requirementNote}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Important Documentation Notice:</strong> Document requirements vary by institution, country, and specific degree program. Not every document listed above is mandatory for every applicant. Our admissions team customizes and manages your exact checklist in the CRM based on your chosen course, institution, and destination.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* PHASE 7: CONFIGURABLE 10-STAGE APPLICATION WORKFLOW TRANSPARENCY          */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section aria-labelledby="workflow-tracking-heading" className="glass-card bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white space-y-6 shadow-luxury">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <span className="bg-gold-500/20 text-gold-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  CRM &amp; Application Tracking Integration
                </span>
                <h2 id="workflow-tracking-heading" className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                  10-Stage Application Status Workflow
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Every College Admission Assistance enquiry is tracked through a structured 10-stage workflow by authorized advisors—with verified confirmation required before any application is marked submitted or offer received.
                </p>
              </div>
              <div className="text-xs bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
                <p className="text-[10px] uppercase text-gold-400 font-bold">Tracked Attributes</p>
                <p className="font-bold text-white">Checklist • Deadlines • Offer Conditions • Follow-Ups</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {workflowStages.map((st) => (
                <div
                  key={st.step}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 hover:border-gold-500/40 transition"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-gold-400 font-bold">
                    <span>STAGE {st.step < 10 ? `0${st.step}` : st.step}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs font-extrabold text-white">{st.name}</p>
                  <p className="text-[11px] text-slate-300 leading-snug">{st.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* PHASE 6: ADMISSION ENQUIRY FORM ("COLLEGE ADMISSION CONSULTATION")        */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section id="college-admission-consultation" aria-label="College Admission Consultation Form" className="scroll-mt-24">
            <CollegeAdmissionsForm initialValues={prefillData} />
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* PHASE 9: ACCESSIBLE FAQ ACCORDION                                         */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section aria-labelledby="college-adm-faq-heading" className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Verified Admissions Policies
              </span>
              <h2 id="college-adm-faq-heading" className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Clear answers regarding course selection, predicted grades, transfer applications, and institutional admission policies.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                const panelId = `college-adm-faq-panel-${idx}`;
                const btnId = `college-adm-faq-btn-${idx}`;
                return (
                  <div
                    key={idx}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      id={btnId}
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full text-left p-4 sm:p-5 flex justify-between items-center text-xs sm:text-sm font-bold text-navy-900 dark:text-white hover:text-gold-500 transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-500 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-gold-500 shrink-0" />
                        <span>{faq.q}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gold-500 shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      )}
                    </button>
                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        className="px-5 pb-5 pt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium border-t border-slate-100 dark:border-navy-800/60"
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* PHASE 8: RELATED ACADEMIC ADVISORY SERVICES                               */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section aria-labelledby="related-services-heading" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 dark:text-gold-400">
                  Integrated Academic Ecosystem
                </span>
                <h2 id="related-services-heading" className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  Related Academic Advisory Services
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('education')}
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>View All Academic Services</span>
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
                    <span className="inline-block bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {rel.badge}
                    </span>
                    <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rel.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
                    <button
                      type="button"
                      onClick={() => navigateTo(rel.route)}
                      className="text-xs font-bold text-navy-900 dark:text-gold-400 hover:text-gold-600 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
};


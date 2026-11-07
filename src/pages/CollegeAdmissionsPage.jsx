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
  ClipboardCheck, Clock, BookOpen, CheckSquare, AlertCircle, Layers, Search,
  ChevronRight, MapPin, Check, Briefcase, UserCheck, Shield
} from 'lucide-react';

export const CollegeAdmissionsPage = () => {
  const { navigateTo } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [prefillData, setPrefillData] = useState(null);

  // Interactive Eligibility Assessment State
  const [eligibilityInput, setEligibilityInput] = useState({
    currentQualification: 'Class 12 / Higher Secondary (Completed or Appearing)',
    academicResults: '',
    preferredCourse: '',
    preferredDestination: 'India (Premier Colleges & Universities)'
  });
  const [eligibilityFeedback, setEligibilityFeedback] = useState(null);

  // Interactive Document Checklist Filter & Check State
  const [docCourseFilter, setDocCourseFilter] = useState('all');
  const [docDestinationFilter, setDocDestinationFilter] = useState('all');
  const [checkedDocs, setCheckedDocs] = useState({
    'doc-marksheets': true,
    'doc-id-passport': true
  });

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

  // 4 Key Hero Information Blocks
  const heroInfoBlocks = [
    {
      label: 'Degrees Supported',
      value: 'UG, PG, B.Tech, B.Sc., B.A., B.Com, MBA',
      icon: GraduationCap
    },
    {
      label: 'Support Scope',
      value: 'End-to-End Application Assistance',
      icon: Layers
    },
    {
      label: 'Application Support',
      value: 'Direct Institutional Portal Guidance',
      icon: Compass
    },
    {
      label: 'Offer Tracking',
      value: 'Conditional & Unconditional Offer Follow-up',
      icon: ClipboardCheck
    }
  ];

  // Six College Admission Service Cards
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
        'Explore suitable courses, colleges, and accredited universities.',
        'Compare available programs, cutoffs, and entry requirements.',
        'Provide a personalized, balanced college shortlist.'
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
        'Identify relevant course entry requirements and cutoffs.',
        'Explain prerequisite subjects and minimum eligibility criteria.',
        'Highlight any missing documentation needed for admissions.'
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
        'Guide students through centralized and direct application portals.',
        'Explain application requirements, deadlines, and submission steps.',
        'Help structure academic resumes and personal statements.',
        'Review information for completeness before final submission.'
      ],
      actionLabel: 'Start Application Preparation'
    },
    {
      id: 'document-verification-checklist',
      number: '04',
      title: 'Document Verification and Checklist',
      badge: 'Dossier Audit',
      icon: CheckSquare,
      description: 'Course-specific document organization to ensure transcripts, certificates, and IDs are properly audited.',
      points: [
        'Provide a course-specific document preparation checklist.',
        'Help organize academic transcripts, marksheets, and transfer certificates.',
        'Identify applicable identification, certificates, and entrance scorecards.',
        'Track missing documents and pending institutional verifications.'
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
        'Record target colleges, courses, and application portal reference IDs.',
        'Track deadlines, submission status, and pending requirements.',
        'Provide timely alerts for important counseling and cutoff dates.',
        'Allow students and parents to review application progress updates.'
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
        'Help students understand received offer letters and merit ranks.',
        'Track conditional and unconditional offers where applicable.',
        'Explain outstanding conditions, fee payment schedules, and seat confirmation.',
        'Provide guidance on acceptance deadlines and enrollment documentation.'
      ],
      actionLabel: 'Get Offer Letter Guidance'
    }
  ];

  // Intended Audience Groups ("Who Can We Help?")
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

  // Four-Step Admission Process ("How the Admission Process Works")
  const admissionSteps = [
    {
      step: '01',
      title: 'Initial Consultation',
      desc: 'Understand the student’s academic qualifications, career interests, preferred degree streams, budget, and location preferences.'
    },
    {
      step: '02',
      title: 'Course and College Selection',
      desc: 'Identify suitable institutions, review cutoff criteria, and structure a balanced shortlist of reach, target, and safe colleges.'
    },
    {
      step: '03',
      title: 'Application and Document Submission',
      desc: 'Assist with portal form completion, document dossier verification, statement reviews, and timely application submission.'
    },
    {
      step: '04',
      title: 'Offer and Enrollment Follow-up',
      desc: 'Help track application updates, clarify conditional or unconditional offers, and guide fee and enrollment confirmation.'
    }
  ];

  // Configurable Documentation Checklist
  const checklistDocuments = [
    {
      id: 'doc-marksheets',
      title: 'Class 10 and Class 12 Marksheets & Passing Certificates',
      applicability: 'Applicable for UG, Diploma & PG verification',
      courses: ['all', 'ug', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Predicted grades or provisional marksheets may be used for initial conditional application.'
    },
    {
      id: 'doc-diploma-degree',
      title: 'Diploma or Bachelor’s Degree Certificates',
      applicability: 'Applicable for Diploma holders & PG applicants',
      courses: ['all', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Provisional degree certificate or consolidated marksheets for graduating applicants.'
    },
    {
      id: 'doc-transcripts',
      title: 'Official Academic Transcripts',
      applicability: 'Semester-wise consolidated institutional records',
      courses: ['all', 'ug', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Requested for credit evaluation, lateral entry, and postgraduate admissions.'
    },
    {
      id: 'doc-id-passport',
      title: 'Government-Issued Photo ID or Passport',
      applicability: 'Identity verification for candidate registration',
      courses: ['all', 'ug', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Aadhaar / National ID for domestic admissions; valid Passport for international colleges.'
    },
    {
      id: 'doc-sop',
      title: 'Statement of Purpose (SOP) or Personal Statement',
      applicability: 'Statement articulating academic goals and motivation',
      courses: ['all', 'ug', 'pg'],
      destinations: ['all', 'international', 'domestic'],
      requirementNote: 'Required for selective universities, business schools, and specialized honors programs.'
    },
    {
      id: 'doc-lor',
      title: 'Letters of Recommendation (Academic / Faculty)',
      applicability: 'References from school teachers or college professors',
      courses: ['all', 'ug', 'pg'],
      destinations: ['all', 'international'],
      requirementNote: 'Typically 1 to 2 references on institutional letterhead for select universities.'
    },
    {
      id: 'doc-english',
      title: 'Entrance Scorecard or Language Proficiency Results',
      applicability: 'National/State Entrance or IELTS/PTE/DET results',
      courses: ['all', 'ug', 'pg'],
      destinations: ['all', 'international', 'domestic'],
      requirementNote: 'JEE, NEET, CUET, GATE, CAT, or language test results where mandated by the university.'
    },
    {
      id: 'doc-additional',
      title: 'Transfer & Migration Certificate (TC)',
      applicability: 'Issued by previous school or college board',
      courses: ['all', 'ug', 'pg', 'diploma'],
      destinations: ['all', 'domestic', 'international'],
      requirementNote: 'Mandatory at the final enrollment stage upon accepting an admission offer.'
    }
  ];

  const filteredDocuments = checklistDocuments.filter(doc => {
    const courseMatch = docCourseFilter === 'all' || doc.courses.includes(docCourseFilter);
    const destMatch = docDestinationFilter === 'all' || doc.destinations.includes(docDestinationFilter);
    return courseMatch && destMatch;
  });

  const toggleDocCheck = (id) => {
    setCheckedDocs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;

  // 10-Stage Configurable Application Status Workflow
  const workflowStages = [
    { step: 1, name: 'New Enquiry', desc: 'Enquiry logged and assigned to an advisor' },
    { step: 2, name: 'Consultation Scheduled', desc: 'One-on-one session with student/parent' },
    { step: 3, name: 'Course Selection', desc: 'Target course & college shortlisting' },
    { step: 4, name: 'Documents Pending', desc: 'Collecting & auditing academic records' },
    { step: 5, name: 'Application in Preparation', desc: 'Completing portal forms & statements' },
    { step: 6, name: 'Application Submitted', desc: 'Verified filing into university portal' },
    { step: 7, name: 'Awaiting Decision', desc: 'Monitoring admissions board review' },
    { step: 8, name: 'Offer Received', desc: 'Evaluating offer letter terms & cutoffs' },
    { step: 9, name: 'Enrollment in Progress', desc: 'Fee confirmation & condition clearing' },
    { step: 10, name: 'Closed', desc: 'Admission confirmed & seat secured' }
  ];

  // Related Academic Advisory Services
  const relatedServices = [
    {
      id: 'intl-consult',
      title: 'International Consulting',
      badge: 'Destination Strategy',
      desc: 'Strategic global education advisory comparing study destinations, tuition structures, and eligibility.',
      route: 'education-intl-consult'
    },
    {
      id: 'school-career',
      title: 'School Student Career Guidance',
      badge: 'Stream & Career Mapping',
      desc: 'Scientific aptitude evaluation, stream selection (Grades 8–12), and UG/PG course guidance catalogue.',
      route: 'education-school-career'
    },
    {
      id: 'intl-adm',
      title: 'International Admissions',
      badge: 'Global Portals',
      desc: 'End-to-end university application coordination across UCAS, Common App, and direct international portals.',
      route: 'education-intl-adm'
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
    }
  ];

  // FAQ Accordion Questions & Verified Answers
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
      q: 'What documents do I need before applying?',
      a: 'Commonly requested documents include Class 10 and 12 marksheets, degree/diploma certificates for PG applicants, official academic transcripts, a valid government photo ID or passport, and any mandatory entrance test scorecards. Specialized degrees may also require a Statement of Purpose and faculty recommendation letters.'
    },
    {
      q: 'Do you assist with both Indian and international college applications?',
      a: 'Yes. We assist students applying to leading colleges and universities in India as well as premier regional and international campuses in the UAE, UK, US, Canada, Europe, and Australia. Our guidance is tailored to each institutional portal and board.'
    },
    {
      q: 'Does The Revival International guarantee college admission?',
      a: 'No. As an ethical educational advisory firm, we do not guarantee admissions or seat allotments. Admission decisions rest entirely with the respective university admissions committees based on their published cutoffs, entrance exam ranks, and eligibility guidelines.'
    },
    {
      q: 'Can parents join the college admission consultation?',
      a: 'Yes, we warmly welcome parents and guardians to participate in all consultation sessions. Selecting a college program and managing financial budgets is an important family decision, and family participation ensures clear expectations and informed decisions.'
    },
    {
      q: 'How do I start my college admission assistance process?',
      a: 'You can begin by submitting our consultation form below or completing the quick Eligibility Assessment on this page. An academic advisor will review your marks and reach out to schedule an advisory consultation.'
    }
  ];

  const handleEligibilitySubmit = (e) => {
    e.preventDefault();
    const results = eligibilityInput.academicResults.trim();
    const course = eligibilityInput.preferredCourse.trim();

    if (!results || !course) {
      alert('Please enter your academic results and preferred course to run the eligibility check.');
      return;
    }

    setEligibilityFeedback({
      status: 'Preliminary Review Ready',
      message: `Your profile for ${course} (${eligibilityInput.currentQualification}) with academic score ${results} has been evaluated. Our advisors can map suitable institutions across ${eligibilityInput.preferredDestination}.`,
      action: 'Proceed to Consultation Booking'
    });

    setPrefillData({
      currentQualification: eligibilityInput.currentQualification,
      academicResults: results,
      preferredCourse: course,
      preferredDestination: eligibilityInput.preferredDestination,
      additionalQuestions: `[From Eligibility Check]: Evaluated ${course} with score ${results}. Requesting college options in ${eligibilityInput.preferredDestination}.`
    });

    scrollToSection('college-admission-consultation');
  };

  const handleServiceCardAction = (srv) => {
    trackCtaClick(srv.actionLabel, 'service_card', 'college-adm');
    if (srv.targetSection) {
      scrollToSection(srv.targetSection);
    } else {
      setPrefillData(prev => ({
        ...prev,
        additionalQuestions: `[Interested in Module ${srv.number}: ${srv.title}]. Please provide guidance on this service.`
      }));
      scrollToSection('college-admission-consultation');
    }
  };

  // Structured Data Schema
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'The Revival International - College Admission Assistance',
      'url': 'https://www.therevivalinternational.com/college-admission',
      'description': 'End-to-end college admission assistance, university shortlisting, course selection, eligibility diagnostics, and application dossier management.',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Dubai',
        'addressCountry': 'AE'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(item => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.a
        }
      }))
    }
  ];

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/#services' },
    { name: 'College Admission Assistance', url: '/#college-admission' }
  ];

  return (
    <div className="bg-[#F7F9FC] text-[#263238] font-sans min-h-screen selection:bg-[#C6A45C]/30 selection:text-[#102A43]">
      <EducationSEO
        title="College Admission Assistance | The Revival International"
        description="End-to-end college admission assistance, university shortlisting, course selection, eligibility diagnostics, and application dossier management."
        canonicalPath="college-admission"
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
        keywords="College Admission Assistance, University Applications, College Course Selection, Higher Education Advisory, Admission Eligibility, College Application Portal Guidance"
      />

      {/* SECTION 1: HERO BANNER (Clean White Background with Premium Corporate Accents) */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 bg-white border-b border-gray-200/80">
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
            <span className="text-[#C6A45C] font-semibold">
              College Admission Assistance
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Heading, Subheading, Description, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102A43]/5 border border-[#102A43]/15 text-[#102A43] text-xs font-bold tracking-widest uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A45C]" />
                <span>HIGHER EDUCATION ADVISORY</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#102A43] tracking-tight leading-[1.15]">
                College Admission Assistance
              </h1>

              <p className="text-xl sm:text-2xl font-medium text-[#C6A45C] leading-snug">
                Strategic University Application &amp; College Enrollment Support
              </p>

              <p className="text-[#475569] text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Navigate your higher education journey with structured college and university admission support. From course selection and eligibility diagnostics to application preparation, document auditing, deadline tracking, and offer-letter guidance, our advisors help students secure admissions with clarity and confidence.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    trackCtaClick('hero_book_free_consultation', 'College Admission Assistance');
                    scrollToSection('college-admission-consultation');
                  }}
                  className="px-8 py-4 rounded-xl bg-[#102A43] hover:bg-[#1a3d60] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book Free Consultation</span>
                  <ArrowRight className="w-4 h-4 text-[#C6A45C]" />
                </button>

                <button
                  onClick={() => {
                    trackCtaClick('hero_check_eligibility', 'College Admission Assistance');
                    scrollToSection('who-can-we-help-section');
                  }}
                  className="px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-[#102A43] border border-gray-300 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4 text-[#C6A45C]" />
                  <span>Check Admission Eligibility</span>
                </button>
              </div>

              {/* 4 Hero Information Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                {heroInfoBlocks.map((block, idx) => {
                  const Icon = block.icon;
                  return (
                    <div key={idx} className="p-3 bg-[#F7F9FC] rounded-xl border border-gray-200/80">
                      <div className="flex items-center gap-1.5 text-[#C6A45C] mb-1">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{block.label}</span>
                      </div>
                      <p className="text-xs font-bold text-[#102A43] leading-tight">{block.value}</p>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Column: High-Quality College Admissions Image & Floating Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100 group">
                <img
                  src="/images/international_admissions.jpg"
                  alt="Students Reviewing College Admission Applications and Courses"
                  className="w-full h-[380px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Card: Personalized College Placement Advisory */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-6 sm:-left-6 bg-white text-[#102A43] rounded-xl p-4 sm:p-5 shadow-2xl border border-gray-200 flex items-center gap-4 max-w-[320px]">
                <div className="w-12 h-12 rounded-lg bg-[#102A43] text-[#C6A45C] flex items-center justify-center shrink-0 shadow-md">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Admission Milestone
                  </div>
                  <div className="text-sm font-bold text-[#102A43] leading-snug">
                    Personalized College Placement Advisory
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: SIX ADMISSION SUPPORT MODULES */}
      <section id="admission-modules" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Six Admission Support Modules
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              A structured advisory curriculum guiding students from initial course exploration to enrollment readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {admissionServices.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="bg-[#F7F9FC] rounded-2xl p-7 border border-gray-200/90 hover:border-[#C6A45C]/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#102A43] text-[#C6A45C] flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="bg-white text-[#102A43] border border-gray-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {srv.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-mono font-bold text-[#C6A45C] uppercase tracking-wider">
                        Module {srv.number}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#102A43] mt-1 group-hover:text-[#C6A45C] transition-colors">
                        {srv.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="pt-2 border-t border-gray-200/80">
                      <ul className="space-y-2">
                        {srv.points.map((pt, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-2 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A45C] shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200/80 mt-6">
                    <button
                      type="button"
                      onClick={() => handleServiceCardAction(srv)}
                      className="w-full py-2.5 px-4 bg-white hover:bg-[#102A43] text-[#102A43] hover:text-white font-bold text-xs rounded-xl border border-gray-300 hover:border-[#102A43] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>{srv.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 3: ELIGIBILITY ASSESSMENT & WHO CAN WE HELP */}
      <section id="who-can-we-help-section" className="py-20 bg-[#F7F9FC] border-y border-gray-200/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Who Can We Help &amp; Eligibility Assessment
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Objective evaluation tailored to your qualification level, target stream, and institutional cutoffs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: 5 Student Groups */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xl font-serif font-bold text-[#102A43] mb-4">
                Tailored Advisory by Student Background
              </h3>

              {studentGroups.map((group, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-full bg-[#102A43]/5 text-[#102A43] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C6A45C]" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#102A43]">
                        {group.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#102A43]/5 text-[#102A43] border border-gray-200">
                        {group.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {group.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Interactive Eligibility Assessment Tool */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="space-y-1 pb-3 border-b border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#C6A45C] flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Interactive Diagnostic Tool
                </span>
                <h3 className="font-serif text-xl font-bold text-[#102A43]">
                  Evaluate My Admission Eligibility
                </h3>
                <p className="text-xs text-gray-500">
                  Enter your academic credentials below for an instant preliminary course alignment check.
                </p>
              </div>

              <form onSubmit={handleEligibilitySubmit} className="space-y-4">
                <div>
                  <label htmlFor="elig-qual" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Current Qualification
                  </label>
                  <select
                    id="elig-qual"
                    value={eligibilityInput.currentQualification}
                    onChange={(e) => setEligibilityInput(prev => ({ ...prev, currentQualification: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                  >
                    <option value="Class 12 / Higher Secondary (Completed or Appearing)">Class 12 / Higher Secondary</option>
                    <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                    <option value="Bachelor’s Degree (Undergraduate)">Bachelor’s Degree (Undergraduate)</option>
                    <option value="College Transfer Applicant">College Transfer Applicant</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="elig-results" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Academic Results / Percentage
                  </label>
                  <input
                    id="elig-results"
                    type="text"
                    placeholder="e.g. 85%, CGPA 8.2, or Predicted 90%"
                    value={eligibilityInput.academicResults}
                    onChange={(e) => setEligibilityInput(prev => ({ ...prev, academicResults: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="elig-course" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Preferred Course / Degree Stream
                  </label>
                  <input
                    id="elig-course"
                    type="text"
                    placeholder="e.g. B.Tech Computer Science, BBA, B.Com"
                    value={eligibilityInput.preferredCourse}
                    onChange={(e) => setEligibilityInput(prev => ({ ...prev, preferredCourse: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="elig-dest" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Target Study Location
                  </label>
                  <select
                    id="elig-dest"
                    value={eligibilityInput.preferredDestination}
                    onChange={(e) => setEligibilityInput(prev => ({ ...prev, preferredDestination: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
                  >
                    <option value="India (Premier Colleges & Universities)">India (Premier Colleges &amp; Universities)</option>
                    <option value="United Arab Emirates & GCC Universities">UAE &amp; GCC Universities</option>
                    <option value="United Kingdom & Europe">United Kingdom &amp; Europe</option>
                    <option value="United States & Canada">United States &amp; Canada</option>
                    <option value="Australia & New Zealand">Australia &amp; New Zealand</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#102A43] hover:bg-[#1a3d60] text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4 text-[#C6A45C]" />
                  <span>Evaluate My Eligibility &amp; Pre-Fill Booking</span>
                </button>
              </form>

              {eligibilityFeedback && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{eligibilityFeedback.status}</span>
                  </div>
                  <p className="leading-relaxed">{eligibilityFeedback.message}</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: FOUR-STEP ADMISSION PROCESS */}
      <section id="admission-process-section" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Our College Admission Process
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              A transparent four-stage methodology ensuring organized application timelines and enrollment success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {admissionSteps.map((item) => (
              <div
                key={item.step}
                className="bg-[#F7F9FC] rounded-2xl p-6 border border-gray-200 shadow-xs hover:border-[#C6A45C] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-[#102A43] text-[#C6A45C] font-serif font-bold text-sm flex items-center justify-center shadow-xs">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                      Stage {item.step} of 04
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#102A43]">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200/80 flex items-center justify-between text-[11px] text-[#C6A45C] font-bold mt-4">
                  <span>Verified Milestone</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 5: ADMISSION DOCUMENT CHECKLIST */}
      <section id="admission-document-checklist" className="py-20 bg-[#F7F9FC] border-y border-gray-200/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 pb-6 border-b border-gray-200">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#C6A45C]">
                Configurable Requirements Dossier
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight mt-1">
                Admission Document Checklist
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Filter documents by program level or destination, and check off records you have prepared.
              </p>
            </div>

            {/* Interactive Filters & Prepared Count */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-[#102A43] shadow-xs">
                {checkedCount} / {checklistDocuments.length} Documents Ready
              </div>

              <select
                aria-label="Filter checklist by course level"
                value={docCourseFilter}
                onChange={(e) => setDocCourseFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              >
                <option value="all">All Program Levels</option>
                <option value="ug">Undergraduate (UG)</option>
                <option value="diploma">Diploma / Lateral Entry</option>
                <option value="pg">Postgraduate (PG)</option>
              </select>

              <select
                aria-label="Filter checklist by study destination"
                value={docDestinationFilter}
                onChange={(e) => setDocDestinationFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#102A43]"
              >
                <option value="all">All Destinations</option>
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
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${isChecked
                      ? 'bg-white border-emerald-300 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isChecked
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-gray-300 bg-gray-50'
                      }`}
                  >
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm font-bold text-[#102A43]">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {doc.applicability}
                    </p>
                    <p className="text-[11px] text-gray-400 italic">
                      {doc.requirementNote}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 6: APPLICATION WORKFLOW TRACKING */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="bg-[#102A43] text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6A45C]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C6A45C] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C6A45C]" />
                Institutional Milestone Management
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-extrabold text-white mt-2">
                10-Stage Application Status Workflow
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm mt-2 leading-relaxed">
                Every application managed by our team is systematically tracked from initial intake to final seat enrollment through our dedicated advisory database.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {workflowStages.map((stage) => (
                <div
                  key={stage.step}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1.5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#C6A45C]">
                      Step {stage.step}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#C6A45C]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {stage.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    {stage.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 7: CONSULTATION BOOKING */}
      <section id="college-admission-consultation" className="py-20 bg-[#F7F9FC] border-t border-gray-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Book Your College Admission Consultation
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Schedule a one-on-one session with our higher education advisors to review your marks, shortlist colleges, and plan your application dossier.
            </p>
          </div>

          <CollegeAdmissionsForm initialValues={prefillData} />

        </div>
      </section>

      {/* SECTION 8: FAQ ACCORDION */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Verified answers regarding college admissions, cutoffs, predicted grades, and document requirements.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-[#F7F9FC] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-serif font-semibold text-[#102A43] text-base hover:text-[#C6A45C] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-xs border border-gray-200">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#C6A45C]" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 9: RELATED ADVISORY SERVICES */}
      <section className="py-20 bg-[#F7F9FC] border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A45C]">
              Comprehensive Education Advisory
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102A43] mt-1">
              Explore Related Education Services
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#C6A45C] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#102A43]/5 text-[#102A43] border border-gray-200">
                    {srv.badge}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#102A43]">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4">
                  <button
                    onClick={() => navigateTo(srv.route)}
                    className="text-xs font-bold text-[#102A43] hover:text-[#C6A45C] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Service Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section className="py-20 bg-[#102A43] text-white relative overflow-hidden">
        <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[#C6A45C]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#C6A45C]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-white mb-4 tracking-tight">
            Ready to Secure Your College Admission?
          </h2>

          <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Connect with our senior education advisors today for personalized course shortlisting, eligibility evaluation, and application dossier management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                trackCtaClick('final_cta_book_free_consultation', 'College Admission Assistance');
                scrollToSection('college-admission-consultation');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C6A45C] hover:bg-[#b5934b] text-[#102A43] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                trackCtaClick('final_cta_contact_team', 'College Admission Assistance');
                navigateTo('contact');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-white/10 text-white border border-[#C6A45C] hover:border-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Contact Admissions Team</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CollegeAdmissionsPage;

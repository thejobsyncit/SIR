import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import { InternationalConsultingForm } from '../components/InternationalConsultingForm';
import { EducationEnquiryModal } from '../components/EducationEnquiryModal';
import ScrollReveal from '../components/ScrollReveal';
import { trackServiceView, trackCtaClick } from '../services/analytics';
import { 
  Globe, Compass, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Calendar, ShieldCheck, Award, FileText, Users, DollarSign, Clock, HelpCircle,
  Sparkles, GraduationCap, Building2, ExternalLink, MapPin, Check, BookOpen, Send
} from 'lucide-react';

export const InternationalConsultingPage = () => {
  const { navigateTo } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(0);
  const [calculatorIntake, setCalculatorIntake] = useState('Fall 2026');
  const [calculatorLevel, setCalculatorLevel] = useState('Postgraduate');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    trackServiceView('intl-consult', 'International Consulting', 'Consulting');
  }, []);

  // Verified Study Destinations Dataset
  const studyDestinations = [
    {
      country: 'United Kingdom',
      flag: '🇬🇧',
      badge: 'Premier Academic Heritage',
      tuitionRange: '£14,000 – £32,000 / year',
      livingCost: '£11,000 – £15,000 / year',
      postStudyWork: '2 Years (Graduate Route) / 3 Years for PhD',
      intakes: 'September (Primary) & January (Secondary)',
      languageRequirements: 'IELTS 6.0 – 7.0 / DET 115+ / PTE 58+',
      visaCategory: 'Student Visa (Subclass 4) with CAS',
      highlights: [
        '1-Year Accelerated Master’s degree structure saves living costs',
        'World-renowned Russell Group universities and research institutions',
        'Part-time work permitted up to 20 hours/week during term-time',
        'Direct admission progression pathways for GCC and international curricula'
      ]
    },
    {
      country: 'United States',
      flag: '🇺🇸',
      badge: 'Global Innovation & Research',
      tuitionRange: '$22,000 – $48,000 / year',
      livingCost: '$14,000 – $20,000 / year',
      postStudyWork: '1 Year OPT / Up to 3 Years for STEM-Designated Degrees',
      intakes: 'Fall (August) & Spring (January)',
      languageRequirements: 'IELTS 6.5+ / TOEFL 85+ / DET 120+',
      visaCategory: 'F-1 Student Visa with Form I-20',
      highlights: [
        'Over 4,000 accredited degree-granting colleges and universities',
        'STEM extension provides 36 months total post-study work authorization',
        'Generous institutional merit scholarships and graduate assistantships',
        'Flexible academic curriculum allowing double majors and interdisciplinary minors'
      ]
    },
    {
      country: 'Canada',
      flag: '🇨🇦',
      badge: 'Welcoming Multi-Cultural Pathways',
      tuitionRange: 'CAD 18,000 – CAD 36,000 / year',
      livingCost: 'CAD 15,000 – CAD 20,000 / year',
      postStudyWork: 'Up to 3 Years Post-Graduation Work Permit (PGWP)',
      intakes: 'September (Fall), January (Winter) & May (Summer)',
      languageRequirements: 'IELTS 6.5 / PTE Academic 60+',
      visaCategory: 'Study Permit with Letter of Acceptance (LOA)',
      highlights: [
        'Direct alignment between Canadian credentials and Express Entry PR points',
        'Affordable tuition relative to US private higher education',
        'Co-op work terms integrated into undergraduate and graduate programs',
        'High standard of campus safety and international student support services'
      ]
    },
    {
      country: 'Australia',
      flag: '🇦🇺',
      badge: 'High Quality of Life & Research',
      tuitionRange: 'AUD 24,000 – AUD 42,000 / year',
      livingCost: 'AUD 20,000 – AUD 25,000 / year',
      postStudyWork: '2 to 4 Years (Temporary Graduate Visa Subclass 485)',
      intakes: 'Semester 1 (February) & Semester 2 (July)',
      languageRequirements: 'IELTS 6.5 / PTE 58+',
      visaCategory: 'Student Visa (Subclass 500)',
      highlights: [
        'Group of Eight (Go8) research-intensive world top-100 institutions',
        'Generous post-study work provisions across regional and metropolitan campuses',
        'Streamlined visa processing through Genuine Student (GS) assessment',
        'Vibrant international student communities across Sydney, Melbourne, and Brisbane'
      ]
    },
    {
      country: 'Germany & Europe',
      flag: '🇩🇪',
      badge: 'Engineering & Low-Tuition Excellence',
      tuitionRange: 'Free – €3,000 / yr (Public) | €10,000 – €18,000 (Private)',
      livingCost: '€11,208 / year (Statutory Blocked Account)',
      postStudyWork: '18 Months Post-Study Jobseeker Permit',
      intakes: 'Winter (October) & Summer (April)',
      languageRequirements: 'English (IELTS 6.5) for English-Taught / TestDaF for German',
      visaCategory: 'National Student Visa (Type D)',
      highlights: [
        'Tuition-free higher education at top public universities in 15 of 16 German states',
        'World-leading technical universities (TU9) and applied science institutions',
        'EU Blue Card transition pathway after securing skilled employment',
        'Shengen Area mobility permitting exploration across 27 European nations'
      ]
    },
    {
      country: 'United Arab Emirates',
      flag: '🇦🇪',
      badge: 'GCC Regional Hub & Global Campuses',
      tuitionRange: 'AED 45,000 – AED 95,000 / year',
      livingCost: 'AED 30,000 – AED 50,000 / year',
      postStudyWork: 'Green Visa (5-Year) & Golden Visa (10-Year for Outstanding Graduates)',
      intakes: 'September (Fall) & January (Spring)',
      languageRequirements: 'IELTS 6.0+ / EmSAT English 1400+',
      visaCategory: 'University-Sponsored Student Residence Visa',
      highlights: [
        'Premier branch campuses of UK, Australian, and US universities in Dubai & Abu Dhabi',
        'Tax-free economy with immediate access to multinational corporate internships',
        'No currency conversion or long-haul relocation required for GCC residents',
        'Fast-track Golden Visa pathways for students with cumulative GPA 3.8+'
      ]
    }
  ];

  // 4 Core Verified Pillars
  const consultingPillars = [
    {
      icon: Compass,
      title: 'Destination & Country Comparison',
      desc: 'Unbiased evaluation of tuition structures, cost of living, post-study work authorization (PSW), and long-term residency prospects across the UK, USA, Canada, Australia, Europe, and the UAE.',
      points: [
        'Comparative ROI and lifetime value modeling',
        'Post-study work rights and employment permit rules',
        'Campus safety, healthcare and accommodation standards',
        'GCC attestation and Ministry equivalence verification'
      ]
    },
    {
      icon: FileText,
      title: 'Academic Profile & Credential Evaluation',
      desc: 'Comprehensive diagnostic review of your GPA, standardized test scores, course prerequisites, and extracurricular achievements to establish university eligibility tiers.',
      points: [
        'International GPA and percentage conversion analysis',
        'Prerequisite course gap audit for specialized majors',
        'Three-tier shortlist: Aspirational, Target, and Safe institutions',
        'Language proficiency benchmarking (IELTS, DET, TOEFL, OET)'
      ]
    },
    {
      icon: DollarSign,
      title: 'Budget, Financial Modeling & Scholarships',
      desc: 'Transparent multi-year cost forecasting covering tuition fees, accommodation, living expenses, proof of funds requirements, and institutional merit scholarship opportunities.',
      points: [
        'Detailed year-by-year financial requirement breakdown',
        'Institutional merit scholarship identification & essay strategy',
        'Country-specific blocked account & proof of funds protocols',
        'Fee payment schedule and currency hedging advisory'
      ]
    },
    {
      icon: ShieldCheck,
      title: 'Student Visa & Immigration Policy Advisory',
      desc: 'Authoritative guidance on changing student visa regulations, financial sponsorship documentation, genuine student criteria, and dependent family regulations.',
      points: [
        'UK CAS, US Form I-20, Canadian LOA compliance checklists',
        'Financial sponsorship affidavit and bank balance verification',
        'Genuine Student (GS) / Genuine Temporary Entrant (GTE) prep',
        'Dependent spouse and children visa policy guidance'
      ]
    }
  ];

  // Target Audiences
  const targetAudiences = [
    {
      title: 'High School Seniors & Parents',
      subtitle: 'Undergraduate Overseas Pathways',
      desc: 'High school students completing IB, CBSE, Cambridge A-Levels, or American curricula planning their first international bachelor degree experience.',
      outcomes: ['Prerequisite course matching', 'Campus environment selection', 'Guardian communication clarity']
    },
    {
      title: 'University Graduates & Aspirants',
      subtitle: 'Master’s & Postgraduate Tracks',
      desc: 'Degree holders seeking prestigious Master’s, M.Sc., or PhD degrees abroad to accelerate career trajectory and international professional recognition.',
      outcomes: ['1-Year vs 2-Year degree comparison', 'Research supervisor alignment', 'Post-study work maximization']
    },
    {
      title: 'Mid-Career Executives & Professionals',
      subtitle: 'International MBA & Executive Programs',
      desc: 'Working professionals seeking specialized overseas management programs, executive MBAs, or career transition programs with global mobility.',
      outcomes: ['Executive resume alignment', 'GMAT/GRE waiver strategy', 'Global industry network access']
    },
    {
      title: 'Schools & Educational Institutions',
      subtitle: 'Institutional Guidance Partnerships',
      desc: 'High schools, colleges, and training academies seeking structured study abroad guidance workshops and admission counseling pipelines for their cohorts.',
      outcomes: ['Cohort admission seminars', 'Verified institution directories', 'Direct counselor alignment']
    }
  ];

  // 4-Step Methodology
  const processSteps = [
    {
      step: '01',
      title: 'Initial Discovery & Credential Diagnostic',
      desc: 'We review your academic transcripts, English proficiency status, career objectives, and family budget parameters during a structured 1-on-1 discovery session.'
    },
    {
      step: '02',
      title: 'Strategic Shortlisting & Institutional Tiering',
      desc: 'Receive an institutional recommendation matrix dividing target universities into Aspirational (Reach), Target (Competitive), and Safe (High Acceptance) tiers.'
    },
    {
      step: '03',
      title: 'Financial Architecture & Scholarship Strategy',
      desc: 'We map out tuition installment schedules, statutory proof of funds requirements, and identify applicable institutional bursaries and merit grants.'
    },
    {
      step: '04',
      title: 'Application Handoff & Pre-Departure Roadmapping',
      desc: 'Seamless transition into direct university portal submissions, offer letter acceptance guidance, and visa checklist verification.'
    }
  ];

  // Dynamic Timeline Calculator
  const getTimelineMilestones = (intake, level) => {
    if (intake.includes('Fall 2026')) {
      return [
        { period: 'Months 12–10 (Oct – Dec 2025)', phase: 'Discovery & Testing', desc: 'Complete academic profile diagnostic, finalize destination shortlist, and attempt initial IELTS / DET exam.' },
        { period: 'Months 9–7 (Jan – Mar 2026)', phase: 'Portfolio & Documents', desc: 'Secure academic transcripts, draft Statement of Purpose (SOP), and collect letters of recommendation (LORs).' },
        { period: 'Months 6–4 (Apr – Jun 2026)', phase: 'Submission & Offers', desc: 'Submit formal university applications, apply for merit scholarships, and evaluate conditional offers.' },
        { period: 'Months 3–1 (Jul – Aug 2026)', phase: 'Visa & Departure', desc: 'Fulfill financial proof of funds, receive CAS / I-20 / LOA, secure student visa, and attend pre-departure briefing.' }
      ];
    } else if (intake.includes('Spring 2027')) {
      return [
        { period: 'Months 10–8 (Mar – May 2026)', phase: 'Diagnostic & Research', desc: 'Profile assessment, destination shortlisting, and identification of programs offering January / February starts.' },
        { period: 'Months 7–5 (Jun – Aug 2026)', phase: 'Application Submission', desc: 'Early application submission for Spring intake terms, English test completion, and credential evaluation.' },
        { period: 'Months 4–3 (Sep – Oct 2026)', phase: 'Offer Confirmation', desc: 'Unconditional offer acceptance, tuition deposit payment, and issuance of visa confirmation documents.' },
        { period: 'Months 2–1 (Nov – Dec 2026)', phase: 'Visa Stamping & Travel', desc: 'Student visa appointment, health insurance clearance, flight booking, and accommodation arrangement.' }
      ];
    } else {
      return [
        { period: 'Months 16–12 (May – Sep 2026)', phase: 'Early Profile Building', desc: 'Academic score enhancement, internship experiences, extracurricular portfolio curation, and destination selection.' },
        { period: 'Months 11–8 (Oct 2026 – Jan 2027)', phase: 'Standardized Tests & Drafting', desc: 'IELTS/DET test completion, initial personal statement drafts, and academic referee selection.' },
        { period: 'Months 7–5 (Feb – Apr 2027)', phase: 'Round 1 & 2 Submissions', desc: 'Targeting priority institutional scholarship deadlines and early application windows.' },
        { period: 'Months 4–1 (May – Aug 2027)', phase: 'Offer Acceptance & Visa Stamping', desc: 'Firm acceptance, housing guarantee confirmation, and visa processing.' }
      ];
    }
  };

  const currentTimeline = getTimelineMilestones(calculatorIntake, calculatorLevel);

  // Preparation Documents
  const preparationDocs = [
    { title: 'Academic Transcripts & Marksheets', desc: '10th & 12th grade marksheets for UG applicants; complete semester-wise university transcripts and degree certificate for PG applicants.' },
    { title: 'Valid International Passport', desc: 'Passport copy with at least 18 months validity remaining from your projected study start date.' },
    { title: 'Curriculum Vitae / Academic Resume', desc: 'Chronological summary of education, internships, academic projects, technical skills, and volunteer engagements.' },
    { title: 'Language Proficiency Scorecard', desc: 'Official scorecard for IELTS Academic, Duolingo English Test (DET), TOEFL iBT, or PTE Academic (if already attempted).' },
    { title: 'Academic Statement of Purpose (SOP)', desc: 'Initial draft or outline articulating your motivation for the chosen field of study, university choice, and future aspirations.' },
    { title: 'Academic Letters of Recommendation (2)', desc: 'Contact details or recommendation letters from teachers, professors, or academic mentors.' }
  ];

  // FAQs
  const faqs = [
    {
      q: 'What is the primary difference between International Consulting and College Admission Assistance?',
      a: 'International Consulting focuses on high-level strategic roadmap planning: evaluating multiple destination countries, comparing post-study work regulations, calculating total cost of living, assessing entry brackets, and choosing optimal academic pathways. College Admission Assistance is the tactical execution phase where our team prepares and submits specific university portal applications, reviews document formatting, and tracks admission offers.'
    },
    {
      q: 'How does Revival International ensure unbiased destination advice?',
      a: 'We evaluate destinations based on your verified academic profile, budget parameters, post-study goals, and global accreditation standards. We do not steer students toward specific private institutions based on sales incentives, and we present transparent comparative data across all eligible global regions.'
    },
    {
      q: 'Can Revival International assist with institutional merit scholarship applications?',
      a: 'Yes. Our advisors identify university-specific merit scholarships, departmental bursaries, and early-admissions fee reductions across the UK, USA, Canada, Australia, and Europe, and provide guidance on structuring compelling scholarship motivation letters.'
    },
    {
      q: 'Are consulting sessions available in-person in Dubai or online?',
      a: 'We provide both flexible virtual consultations via secure video conference for candidates and parents across the GCC and internationally, as well as in-person advisory sessions at our headquarters in Dubai (Business Bay).'
    },
    {
      q: 'How far in advance should I begin International Consulting?',
      a: 'We strongly advise beginning strategic consulting 9 to 12 months before your target intake (e.g., initiating in October or November for the subsequent September intake). This provides sufficient time for standardized language testing, SOP drafting, and maximizing institutional scholarship deadlines.'
    }
  ];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'International Consulting & Global Education Advisory',
      'serviceType': 'Educational Consulting & Study Abroad Advisory',
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'Revival International Academic Advisory',
        'url': 'https://www.revivalinternational.com/international-consulting',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Dubai',
          'addressRegion': 'Dubai',
          'addressCountry': 'AE'
        }
      },
      'description': 'Premier strategic international education consulting: destination comparison, academic profile assessment, scholarship planning, and student visa compliance.',
      'areaServed': ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'Global']
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

  const scrollToEnquiryForm = () => {
    const el = document.getElementById('consulting-enquiry-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-24 text-slate-800 dark:text-slate-200">
      <EducationSEO
        title="International Consulting & Study Abroad Advisory Dubai"
        description="Strategic international consulting for students and parents: global destination comparison (UK, US, Canada, Australia, Germany, UAE), academic profile evaluation, scholarship modeling, and student visa compliance."
        canonicalPath="international-consulting"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Academic Advisory', item: '/education' },
          { name: 'International Consulting', item: '/international-consulting' }
        ]}
        structuredData={structuredData}
      />

      {/* Sticky Breadcrumb Bar */}
      <div className="bg-white/85 dark:bg-navy-950/85 border-b border-slate-200 dark:border-navy-800 backdrop-blur-md sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 font-medium overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => navigateTo('home')}
              className="hover:text-gold-500 transition focus:outline-none focus:text-gold-500"
            >
              Home
            </button>
            <span>/</span>
            <button 
              onClick={() => navigateTo('education')}
              className="hover:text-gold-500 transition focus:outline-none focus:text-gold-500"
            >
              Academic Advisory
            </button>
            <span>/</span>
            <span className="text-gold-600 dark:text-gold-400 font-bold">
              International Consulting
            </span>
          </nav>

          <button
            onClick={() => navigateTo('education')}
            className="hidden sm:flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 hover:text-gold-500 font-bold text-xs transition shrink-0 ml-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Education Services</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-16">

        {/* HERO SECTION */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            <div className="max-w-3xl space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-gold-500/30">
                  Global Pathways
                </span>
                <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                  Verified Service • Consulting
                </span>
                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                  Dubai HQ • Worldwide Advisory
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white leading-tight">
                International Consulting
              </h1>

              <p className="text-base sm:text-lg text-gold-600 dark:text-gold-400 font-serif italic">
                Strategic Global Education Advisory & Destination Planning
              </p>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Navigate the complexities of overseas education with tailored roadmap consulting. From evaluating academic credentials and choosing the ideal study destination to analyzing multi-year tuition cost structures and long-term post-study residency pathways, our senior advisors support your entire journey.
              </p>

              {/* CTAs */}
              <div className="pt-3 flex flex-wrap gap-3.5 items-center">
                <button
                  onClick={() => {
                    trackCtaClick('Book Free Consultation', 'hero_consulting', 'intl-consult');
                    scrollToEnquiryForm();
                  }}
                  className="px-6 py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Free Consultation</span>
                </button>

                <button
                  onClick={() => {
                    trackCtaClick('Explore Destinations Matrix', 'hero_consulting', 'intl-consult');
                    const el = document.getElementById('destinations-matrix');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs rounded-xl transition border border-slate-200 dark:border-navy-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <span>Explore Destinations Matrix ↓</span>
                </button>

                <button
                  onClick={() => {
                    trackCtaClick('Intake Planner', 'hero_consulting', 'intl-consult');
                    const el = document.getElementById('timeline-calculator');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs rounded-xl transition border border-slate-200 dark:border-navy-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <span>Intake Planner ↓</span>
                </button>
              </div>

              {/* Key Quick Stats */}
              <div className="pt-6 border-t border-slate-100 dark:border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Destinations</p>
                  <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">18+ Countries</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Advisory Level</p>
                  <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">UG & PG Tracks</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Counselling Model</p>
                  <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">1-on-1 Personalized</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Intake Support</p>
                  <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">Fall, Spring & Summer</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 4 VERIFIED CONSULTING PILLARS */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Comprehensive Advisory Scope
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
                Four Pillars of International Consulting
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Rigorous, data-backed guidance designed to maximize admission probabilities and long-term return on international education investment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {consultingPillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div 
                    key={idx}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500/50 transition shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 border border-gold-500/30">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white leading-snug">
                        {pillar.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {pillar.desc}
                    </p>

                    <div className="p-3 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-100 dark:border-navy-800 space-y-1.5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Key Deliverables:</p>
                      <ul className="space-y-1 text-xs">
                        {pillar.points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <span className="text-gold-500 font-bold shrink-0">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* INTERACTIVE DESTINATIONS COMPARISON MATRIX */}
        <ScrollReveal>
          <div id="destinations-matrix" className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-200 dark:border-navy-800 pb-4">
              <div>
                <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                  Global Destinations Benchmark
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mt-1">
                  Interactive Study Destination Explorer
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                  Compare tuition costs, living expense indices, post-study work authorization duration, and entry prerequisites side by side.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Select destination:</span>
              </div>
            </div>

            {/* Destination Selection Tabs */}
            <div className="flex flex-wrap gap-2">
              {studyDestinations.map((dest, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDestinationIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedDestinationIndex === idx
                      ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                      : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500'
                  }`}
                >
                  <span>{dest.flag}</span>
                  <span>{dest.country}</span>
                </button>
              ))}
            </div>

            {/* Selected Destination Details Card */}
            {(() => {
              const activeDest = studyDestinations[selectedDestinationIndex];
              return (
                <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{activeDest.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
                            {activeDest.country}
                          </h3>
                          <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-gold-500/20">
                            {activeDest.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Primary Visa: <strong className="text-slate-800 dark:text-slate-200">{activeDest.visaCategory}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={scrollToEnquiryForm}
                      className="px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-700 dark:text-gold-400 border border-gold-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inquire About {activeDest.country}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tuition Fee Range</p>
                      <p className="font-mono text-sm sm:text-base font-extrabold text-navy-900 dark:text-white">{activeDest.tuitionRange}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cost of Living</p>
                      <p className="font-mono text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">{activeDest.livingCost}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Post-Study Work (PSW)</p>
                      <p className="font-mono text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{activeDest.postStudyWork}</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Language Score Benchmarks</p>
                      <p className="font-mono text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">{activeDest.languageRequirements}</p>
                    </div>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-2">
                    <p className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-gold-500" />
                      <span>Destination Highlights & Regulatory Characteristics:</span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {activeDest.highlights.map((item, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <span className="text-gold-500 font-bold shrink-0">✔</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </ScrollReveal>

        {/* INTAKE PLANNING TIMELINE CALCULATOR */}
        <ScrollReveal>
          <div id="timeline-calculator" className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Intake Preparation Roadmap
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
                Intake Planning Timeline Calculator
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select your intended start term and degree track to calculate recommended milestones and document readiness deadlines.
              </p>
            </div>

            {/* Interactive Calculator Selectors */}
            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-3xl space-y-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-navy-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    1. Target Intake Window:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Fall 2026', 'Spring 2027', 'Fall 2027'].map(term => (
                      <button
                        key={term}
                        onClick={() => setCalculatorIntake(term)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          calculatorIntake === term
                            ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                            : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-slate-200 dark:border-navy-700'
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    2. Degree Level:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Undergraduate', 'Postgraduate', 'Executive MBA'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setCalculatorLevel(lvl)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          calculatorLevel === lvl
                            ? 'bg-gold-shimmer text-navy-950 shadow-gold-glow'
                            : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:border-gold-500 border border-slate-200 dark:border-navy-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Milestones Horizontal / Vertical Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {currentTimeline.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-2 relative"
                  >
                    <div className="flex justify-between items-center">
                      <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold text-xs flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{item.phase}</span>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-navy-900 dark:text-white">
                      {item.period}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* TARGET AUDIENCES */}
        <ScrollReveal>
          <div className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Tailored Advisory Profiles
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
                Who We Advise
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Customized consulting roadmaps tailored to the distinct needs of each academic bracket and institutional stakeholder.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {targetAudiences.map((aud, idx) => (
                <div 
                  key={idx}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-gold-600 dark:text-gold-400 uppercase font-bold tracking-wider">
                      {aud.subtitle}
                    </span>
                    <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                      {aud.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {aud.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Focus Outcomes:</p>
                    <ul className="text-[11px] space-y-0.5 text-slate-700 dark:text-slate-300">
                      {aud.outcomes.map((o, oIdx) => (
                        <li key={oIdx} className="flex items-center gap-1.5">
                          <span className="text-emerald-500 font-bold text-xs">✓</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* 4-STEP CONSULTING METHODOLOGY */}
        <ScrollReveal>
          <div id="workflow-section" className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Structured Advisory Workflow
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
                Our Consulting Methodology
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                A proven, multi-stage counseling journey engineered to guide you from initial discovery through to confirmed overseas enrollment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {processSteps.map((step, idx) => (
                <div 
                  key={idx}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-3 relative shadow-sm"
                >
                  <span className="font-mono text-3xl font-black text-gold-500/30">
                    {step.step}
                  </span>
                  <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* PREPARATION DOCUMENTS CHECKLIST */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold-500" />
                  <span>Recommended Consultation Preparation Documents</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Having these records readily accessible ensures our advisors can perform an immediate, high-fidelity profile assessment.
                </p>
              </div>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-navy-950 px-2.5 py-1 rounded">
                Pre-Consultation Checklist
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preparationDocs.map((doc, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-100 dark:border-navy-800 space-y-1.5"
                >
                  <p className="font-bold text-xs text-navy-900 dark:text-white flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                    <span>{doc.title}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-5 font-medium">
                    {doc.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* EMBEDDED STRATEGIC ENQUIRY FORM SECTION */}
        <ScrollReveal>
          <div id="consulting-enquiry-section" className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Start Your International Journey
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
                Request a Strategic Consultation
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Submit your profile and target study destination to receive a detailed initial diagnostic from our licensed counselors.
              </p>
            </div>

            <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 p-6 sm:p-10 rounded-3xl shadow-luxury max-w-3xl mx-auto">
              <InternationalConsultingForm embedded={true} />
            </div>
          </div>
        </ScrollReveal>

        {/* FAQS SECTION */}
        <ScrollReveal>
          <div className="space-y-6 pt-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Clarifications & Insights
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Essential questions regarding International Consulting scope, procedures, and service boundaries.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden shadow-sm transition"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="w-full p-4 sm:p-5 text-left flex justify-between items-center gap-4 cursor-pointer focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <span className="font-serif font-bold text-xs sm:text-sm text-navy-900 dark:text-white">
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gold-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium border-t border-slate-100 dark:border-navy-800/60 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* RELATED EDUCATION SERVICES */}
        <ScrollReveal>
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-navy-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                  Related Academic Advisory Offerings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explore specialized execution and preparation programs available across the Revival International network.
                </p>
              </div>

              <button
                onClick={() => navigateTo('education')}
                className="text-xs text-gold-600 dark:text-gold-400 hover:underline font-bold flex items-center gap-1"
              >
                <span>View Full Directory (6 Offerings)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'college-adm',
                  title: 'College Admission Assistance',
                  category: 'Admissions',
                  desc: 'End-to-end guidance for undergraduate and postgraduate college admissions across leading institutions in the GCC and worldwide.'
                },
                {
                  id: 'intl-adm',
                  title: 'International Admissions',
                  category: 'Admissions',
                  desc: 'Direct university application processing, document verification, offer letter tracking, and visa checklist guidance.'
                },
                {
                  id: 'exec-seminars-lang',
                  title: 'Executive Seminars & Language Prep',
                  category: 'Language & Executive',
                  desc: 'Specialized test preparation for DET, OET, and IELTS, alongside leadership workshops for corporate executives.'
                }
              ].map(srv => (
                <div 
                  key={srv.id}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between hover:border-gold-500 transition shadow-sm"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase">
                      {srv.category}
                    </span>
                    <h4 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                      {srv.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => navigateTo(`education-${srv.id}`)}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Service Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
};

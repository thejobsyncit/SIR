import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import { SeminarsLanguageForm } from '../components/SeminarsLanguageForm';
import ScrollReveal from '../components/ScrollReveal';
import { trackServiceView, trackCtaClick } from '../services/analytics';
import { 
  Globe, Compass, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Calendar, ShieldCheck, Award, FileText, Users, DollarSign, Clock, HelpCircle,
  Sparkles, GraduationCap, Building2, ExternalLink, MapPin, Check, BookOpen, Send,
  AlertCircle, Briefcase, FileCheck, Landmark, Plane, BadgeCheck, Layers, Presentation,
  Languages, HeartPulse, UserCheck, Target
} from 'lucide-react';

export const SeminarsAndLanguagePage = () => {
  const { navigateTo } = useApp();
  const [formPreselectedProgram, setFormPreselectedProgram] = useState('IELTS');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    trackServiceView('exec-seminars-lang', 'Seminars & Language', 'Executive & Language');
  }, []);

  // Section 1: Hero Info Blocks
  const heroInfoBlocks = [
    {
      icon: Languages,
      label: 'Language Tests',
      value: 'IELTS, OET, DET and TOEFL',
      subtext: 'Certified Test Diagnostic Modules'
    },
    {
      icon: Briefcase,
      label: 'Executive Programs',
      value: 'Leadership and Professional Development',
      subtext: 'High-Impact Corporate Seminars'
    },
    {
      icon: Users,
      label: 'Training Formats',
      value: 'Individual, Group and Corporate Sessions',
      subtext: 'Flexible Virtual & In-Person Cohorts'
    },
    {
      icon: Target,
      label: 'Learning Approach',
      value: 'Structured Preparation and Practice',
      subtext: 'Outcome-Driven Curriculum'
    }
  ];

  // Section 2: Language Test Preparation Programs (4 Cards)
  const languagePrograms = [
    {
      id: 'IELTS',
      title: 'IELTS Preparation',
      badge: 'Academic & General',
      icon: Award,
      desc: 'Comprehensive training for both IELTS Academic and General Training modules to meet university admission and migration benchmarks.',
      points: [
        'Listening, Reading, Writing and Speaking preparation.',
        'Practice tests and performance reviews.',
        'Guidance on test format, timing and question types.',
        'Personalized study plans based on the learner’s needs.'
      ]
    },
    {
      id: 'OET',
      title: 'OET Preparation',
      badge: 'Healthcare Licensure',
      icon: HeartPulse,
      desc: 'Specialized Occupational English Test coaching for medical doctors, registered nurses, and healthcare practitioners seeking global licensure.',
      points: [
        'Preparation for healthcare professionals.',
        'Practice activities relevant to the four OET sub-tests.',
        'Guidance for healthcare-related communication tasks.',
        'Support for candidates preparing for relevant professional registration requirements.'
      ]
    },
    {
      id: 'DET',
      title: 'Duolingo English Test (DET) Preparation',
      badge: 'Computer-Adaptive',
      icon: Languages,
      desc: 'Targeted preparation mastering computer-adaptive question patterns, literacy, conversation, and production subscores.',
      points: [
        'Familiarization with the test format and question types.',
        'Practice activities covering relevant English language skills.',
        'Time-management and test-taking strategies.',
        'Feedback on practice performance.'
      ]
    },
    {
      id: 'TOEFL',
      title: 'TOEFL Preparation',
      badge: 'iBT Benchmark',
      icon: BookOpen,
      desc: 'Rigorous TOEFL iBT preparation focused on integrated academic tasks, speaking simulations, and communicative fluency.',
      points: [
        'Reading, Listening, Speaking and Writing practice.',
        'Guidance on the test format and task types.',
        'Structured practice sessions and progress reviews.',
        'Preparation plans based on the candidate’s target institutions and requirements.'
      ]
    }
  ];

  // Section 3: Executive Seminars & Leadership Development (4 Cards)
  const executivePrograms = [
    {
      id: 'Leadership Seminar',
      title: 'Leadership & Management',
      badge: 'Strategic Leadership',
      icon: Briefcase,
      desc: 'Developing executive agility, strategic alignment, and modern management capabilities for emerging and senior corporate leaders.',
      points: [
        'Leadership effectiveness.',
        'Decision-making and strategic thinking.',
        'Team management and collaboration.',
        'Professional communication.'
      ]
    },
    {
      id: 'Corporate Communication',
      title: 'Corporate Communication',
      badge: 'Workplace Fluency',
      icon: Presentation,
      desc: 'Refining executive presentation, high-stakes stakeholder negotiation, and cross-functional corporate writing.',
      points: [
        'Business communication skills.',
        'Presentation and public-speaking practice.',
        'Workplace communication.',
        'Professional writing and meeting skills.'
      ]
    },
    {
      id: 'Executive Workshop',
      title: 'Executive Development Workshops',
      badge: 'Professional Growth',
      icon: Layers,
      desc: 'Hands-on interactive masterclasses focused on critical thinking, agile conflict resolution, and workplace readiness.',
      points: [
        'Problem-solving and critical thinking.',
        'Teamwork and organizational effectiveness.',
        'Professional growth and workplace readiness.',
        'Customized workshop topics based on organizational needs.'
      ]
    },
    {
      id: 'Corporate Training',
      title: 'Corporate Training Programs',
      badge: 'Enterprise Solutions',
      icon: Building2,
      desc: 'Tailored enterprise learning interventions designed around organizational competency frameworks and strategic KPIs.',
      points: [
        'Training needs consultation.',
        'Group sessions and workshop planning.',
        'Customized learning objectives.',
        'Progress feedback and post-training recommendations.'
      ]
    }
  ];

  // Section 4: Training Methodology (4 Steps)
  const methodologySteps = [
    {
      step: '01',
      title: 'Initial Assessment',
      desc: 'Understand the learner’s goals, current proficiency, or organization’s training requirements through targeted diagnostic evaluations.'
    },
    {
      step: '02',
      title: 'Personalized Training Plan',
      desc: 'Recommend relevant modules, schedules, and learning activities aligned with individual timelines or corporate objectives.'
    },
    {
      step: '03',
      title: 'Practice & Interactive Sessions',
      desc: 'Conduct structured practice, workshops, exercises, and feedback sessions with certified trainers and facilitators.'
    },
    {
      step: '04',
      title: 'Progress Review',
      desc: 'Review learning progress and recommend further practice, advanced enrichment, or developmental milestones.'
    }
  ];

  // Section 5: Who Can Benefit? (6 Audience Cards)
  const audiences = [
    {
      title: 'Students Preparing for English Proficiency Tests',
      desc: 'Mastering test formats, question strategies, and timing techniques for IELTS, DET, and TOEFL to meet higher education requirements.',
      icon: GraduationCap
    },
    {
      title: 'Healthcare Professionals Preparing for OET',
      desc: 'Doctors, nurses, and medical practitioners fulfilling clinical language requirements for UK GMC/NMC, Ireland, and GCC health authorities.',
      icon: HeartPulse
    },
    {
      title: 'University Applicants Preparing for Language Tests',
      desc: 'Prospective undergraduate and postgraduate candidates aiming to satisfy conditional university admissions offers.',
      icon: BookOpen
    },
    {
      title: 'Working Professionals Improving Communication Skills',
      desc: 'Mid-career professionals seeking to enhance workplace English, business writing, and client-facing communication confidence.',
      icon: UserCheck
    },
    {
      title: 'Managers and Executives Developing Leadership',
      desc: 'Department heads and team leaders refining decision-making, strategic influence, and executive management capabilities.',
      icon: Briefcase
    },
    {
      title: 'Corporate Teams Seeking Training & Seminars',
      desc: 'Enterprise cohorts and departmental units needing customized professional development and cross-cultural workshops.',
      icon: Building2
    }
  ];

  // Section 6: Frequently Asked Questions (6 Exact Questions)
  const faqs = [
    {
      q: 'Which language tests do you provide preparation for?',
      a: 'We provide structured preparation for the International English Language Testing System (IELTS Academic and General Training), Occupational English Test (OET for Healthcare), Duolingo English Test (DET), and Test of English as a Foreign Language (TOEFL iBT).'
    },
    {
      q: 'Is OET preparation suitable for healthcare professionals?',
      a: 'Yes. Our OET modules are specifically tailored for doctors, registered nurses, dentists, and allied healthcare professionals preparing for registration and licensure with regulatory bodies in the UK, Ireland, Australia, and the UAE.'
    },
    {
      q: 'Do you offer individual and group training?',
      a: 'Yes. We provide flexible 1-on-1 personalized mentoring sessions, small group interactive batches, and customized enterprise corporate workshops delivered either virtually via live interactive video or in-person.'
    },
    {
      q: 'Can seminars be customized for corporate teams?',
      a: 'Yes. We consult directly with corporate HR and leadership teams to customize workshop topics, learning objectives, case studies, and scheduling based on your organization’s specific development priorities.'
    },
    {
      q: 'Can I receive a personalized learning plan?',
      a: 'Yes. Following an initial diagnostic assessment, our trainers design a customized preparation plan addressing your specific skill gaps, target test dates, or executive development goals.'
    },
    {
      q: 'Does completing a preparation program guarantee a specific exam score?',
      a: 'No. While our certified trainers provide comprehensive strategies, materials, and practice reviews, actual test results depend on individual effort, performance, and external examination conditions. No specific score or licensing outcome is guaranteed.'
    }
  ];

  // Section 7: Related Services (5 Services)
  const relatedServices = [
    {
      id: 'intl-consult',
      title: 'International Consulting',
      badge: 'Strategy',
      desc: 'Strategic global education destination planning, academic profile diagnostics, and long-term advisory.',
      path: 'international-consulting'
    },
    {
      id: 'intl-adm',
      title: 'International Admissions',
      badge: 'Admissions',
      desc: 'End-to-end multi-country application management, document verification, and admissions liaison.',
      path: 'education-intl-adm'
    },
    {
      id: 'college-adm',
      title: 'College Admissions Assistance',
      badge: 'Undergraduate',
      desc: 'Direct higher education college admissions guidance for undergraduate and diploma applicants.',
      path: 'education-college-adm'
    },
    {
      id: 'school-career',
      title: 'School Student Career Guidance',
      badge: 'Foundation',
      desc: 'Aptitude evaluation and career stream selection for middle and high school students.',
      path: 'education-school-career'
    },
    {
      id: 'school-academy',
      title: 'Student Academy',
      badge: 'Enrichment',
      desc: 'Academic study skills cohorts, critical thinking, and student enrichment workshops.',
      path: 'education-school-academy'
    }
  ];

  const handleProgramEnquiry = (programName) => {
    trackCtaClick(`Enquire Program: ${programName}`, 'program_cards', 'exec-seminars-lang');
    setFormPreselectedProgram(programName);
    scrollToSection('seminars-language-consultation');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'Seminars & Language Preparation',
      'serviceType': 'Executive Development & Language Test Preparation',
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'The Revival International Academic Advisory',
        'url': 'https://www.revivalinternational.com/education/executive-seminars-and-language-test-preparation',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Dubai',
          'addressRegion': 'Dubai',
          'addressCountry': 'AE'
        }
      },
      'description': 'Enhance professional communication, leadership capabilities, and language proficiency through structured training programs tailored to individual and organizational needs. Preparation for IELTS, OET, DET, and TOEFL.',
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
    <div className="space-y-16 pb-24 text-slate-800 dark:text-slate-200">
      <EducationSEO
        title="Seminars & Language Preparation | The Revival International"
        description="Enhance professional communication, leadership capabilities, and language proficiency through structured training programs for IELTS, OET, DET, TOEFL, and executive leadership seminars."
        canonicalPath="education/executive-seminars-and-language-test-preparation"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Academic Advisory', item: '/education' },
          { name: 'Seminars & Language', item: '/education/executive-seminars-and-language-test-preparation' }
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
              Seminars & Language
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
        {/* SECTION 1: HERO SECTION — SEMINARS & LANGUAGE                             */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Subtitle, Description, and CTAs */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-gold-500/30">
                    Mastery & Certification
                  </span>
                  <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                    Verified Service • Executive & Language
                  </span>
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white leading-tight">
                  Seminars & Language
                </h1>

                <p className="text-base sm:text-lg text-gold-600 dark:text-gold-400 font-serif italic">
                  Executive Development, Professional Seminars & Certified Language Test Preparation
                </p>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Enhance professional communication, leadership capabilities, and language proficiency through structured training programs tailored to individual and organizational needs. The Revival International offers executive development seminars and preparation support for IELTS, OET, DET, and TOEFL, helping students, healthcare professionals, working professionals, and corporate teams prepare for their academic and career goals.
                </p>

                {/* Two CTA Buttons */}
                <div className="pt-3 flex flex-wrap gap-3.5 items-center">
                  <button
                    onClick={() => {
                      trackCtaClick('Book Free Consultation', 'hero_section', 'exec-seminars-lang');
                      scrollToSection('seminars-language-consultation');
                    }}
                    className="px-6 py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Free Consultation</span>
                  </button>

                  <button
                    onClick={() => {
                      trackCtaClick('Explore Our Programs', 'hero_section', 'exec-seminars-lang');
                      scrollToSection('language-prep-programs');
                    }}
                    className="px-5 py-3.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs sm:text-sm rounded-xl transition border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-gold-500" />
                    <span>Explore Our Programs ↓</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Premium Visual of Seminars & Language Training */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-gold-500/30 group">
                  <img
                    src="/images/seminars_language.jpg"
                    alt="Executive Seminars and Language Training Workshop"
                    className="w-full h-72 sm:h-80 md:h-96 object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />
                  
                  {/* Floating Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md p-3.5 rounded-xl border border-gold-500/30 shadow-lg">
                      <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-navy-800">
                        <span className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-gold-500" />
                          Certified Professional Modules
                        </span>
                        <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded">
                          Active Cohorts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 font-medium leading-snug">
                        IELTS, OET, DET & TOEFL coaching alongside corporate leadership masterclasses.
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
        {/* SECTION 2: LANGUAGE TEST PREPARATION PROGRAMS                             */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div id="language-prep-programs" className="space-y-8 scroll-mt-24">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Language Test Training
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Language Test Preparation Programs
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Structured preparation modules for certified English language examinations, led by experienced trainers with diagnostic simulations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {languagePrograms.map((prog) => {
                const Icon = prog.icon;
                return (
                  <div
                    key={prog.id}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 sm:p-7 space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="w-11 h-11 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full uppercase">
                          {prog.badge}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                        {prog.title}
                      </h3>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {prog.desc}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Program Curriculum & Features:
                        </p>
                        <ul className="space-y-1.5">
                          {prog.points.map((pt, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
                      <button
                        onClick={() => handleProgramEnquiry(prog.id)}
                        className="w-full py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enquire for {prog.title}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compliance Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold uppercase tracking-wider text-[11px]">Academic & Ethical Advisory Notice</p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  The Revival International provides structured test preparation, diagnostic evaluations, and strategic guidance. We do not promise or guarantee specific exam scores, test results, university admission offers, or professional licensing outcomes. Test scores depend upon individual candidate performance and the assessment standards of respective examination bodies.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 3: EXECUTIVE SEMINARS & LEADERSHIP DEVELOPMENT                     */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Professional Masterclasses
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Executive Seminars & Leadership Development
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Interactive executive masterclasses, workplace communication seminars, and enterprise management cohorts. Seminar topics and delivery formats can be customized according to organizational requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {executivePrograms.map((prog) => {
                const Icon = prog.icon;
                return (
                  <div
                    key={prog.id}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 sm:p-7 space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="w-11 h-11 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full uppercase">
                          {prog.badge}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                        {prog.title}
                      </h3>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {prog.desc}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Key Focus Areas:
                        </p>
                        <ul className="space-y-1.5">
                          {prog.points.map((pt, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-navy-800">
                      <button
                        onClick={() => handleProgramEnquiry(prog.id)}
                        className="w-full py-2.5 bg-slate-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 dark:hover:bg-gold-500 dark:hover:text-navy-950 font-bold text-xs rounded-xl border border-slate-200 dark:border-navy-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enquire for {prog.title}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-400 text-center">
              <span className="font-bold text-slate-800 dark:text-slate-200">Customization Notice: </span>
              <span>
                All executive seminar modules and delivery formats can be fully customized for private corporate cohorts, virtual teams, or on-site enterprise masterclasses in Dubai, the GCC, and worldwide.
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 4: TRAINING METHODOLOGY (4 STEPS)                                  */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Methodology
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Training Methodology
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                A structured four-step pedagogical model ensuring targeted diagnostics, personalized modules, interactive practice, and continuous performance review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {methodologySteps.map((step) => (
                <div
                  key={step.step}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 relative hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="w-8 h-8 rounded-full bg-gold-500 text-navy-950 font-extrabold text-xs flex items-center justify-center shadow-gold-glow">
                      {step.step}
                    </span>
                    <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-400 font-mono uppercase tracking-wider border-t border-slate-100 dark:border-navy-800">
                    Stage {step.step} of 04
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 5: WHO CAN BENEFIT? (6 AUDIENCES)                                  */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Target Candidates
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                Who Can Benefit?
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Tailored training cohorts designed for academic aspirants, registered healthcare practitioners, working managers, and corporate leadership teams.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {audiences.map((aud, idx) => {
                const Icon = aud.icon;
                return (
                  <div
                    key={idx}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 space-y-3 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>

                      <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white leading-snug">
                        {aud.title}
                      </h3>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {aud.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-navy-800">
                      <button
                        onClick={() => scrollToSection('seminars-language-consultation')}
                        className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Schedule Training Session</span>
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
        {/* SECTION 6: CONSULTATION AND ENQUIRY FORM                                  */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <div id="seminars-language-consultation" className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 space-y-6 shadow-luxury scroll-mt-24">
            <SeminarsLanguageForm
              embedded={true}
              preselectedProgram={formPreselectedProgram}
              onProgramChange={(newProg) => setFormPreselectedProgram(newProg)}
            />
          </div>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* SECTION 7: FREQUENTLY ASKED QUESTIONS (6 EXACT QUESTIONS)                 */}
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
        {/* SECTION 8: RELATED ACADEMIC ADVISORY SERVICES (5 SERVICES)                 */}
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

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
  Languages, HeartPulse, UserCheck, Target, ChevronRight, Phone, Laptop, Monitor
} from 'lucide-react';

export const SeminarsAndLanguagePage = () => {
  const { navigateTo } = useApp();
  const [formPreselectedProgram, setFormPreselectedProgram] = useState('IELTS Preparation');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    trackServiceView('exec-seminars-lang', 'Seminars & Language', 'Executive & Language');
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProgramSelect = (programName) => {
    setFormPreselectedProgram(programName);
    scrollToSection('seminars-language-consultation');
  };

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
        'Guidance on test formats, timing and question types.',
        'Personalized study plans.'
      ],
      ctaText: 'Enquire for IELTS Preparation'
    },
    {
      id: 'OET',
      title: 'OET Preparation',
      badge: 'Healthcare Professionals',
      icon: HeartPulse,
      desc: 'Specialized occupational English training tailored for healthcare professionals seeking overseas licensure and registration.',
      points: [
        'Preparation for healthcare professionals.',
        'Practice activities for all four OET sub-tests.',
        'Medical communication practice.',
        'Guidance on professional registration requirements.'
      ],
      ctaText: 'Enquire for OET Preparation'
    },
    {
      id: 'TOEFL',
      title: 'TOEFL Preparation',
      badge: 'Academic English',
      icon: BookOpen,
      desc: 'Rigorous TOEFL iBT preparation focusing on academic integration, university lecture comprehension, and campus communication.',
      points: [
        'Academic English preparation.',
        'Reading, Listening, Speaking and Writing practice.',
        'Mock tests and performance assessment.',
        'University admission preparation guidance.'
      ],
      ctaText: 'Enquire for TOEFL Preparation'
    },
    {
      id: 'DET',
      title: 'Duolingo English Test (DET)',
      badge: 'Computer-Adaptive',
      icon: Languages,
      desc: 'Fast-paced, modern preparation for the adaptive online test accepted by an expanding network of universities worldwide.',
      points: [
        'Computer-adaptive test preparation.',
        'Interactive practice exercises.',
        'Speaking and writing guidance.',
        'Mock assessments and improvement plans.'
      ],
      ctaText: 'Enquire for DET Preparation'
    }
  ];

  // Section 3: Executive Seminars & Leadership Development (4 Cards)
  const executivePrograms = [
    {
      id: 'Leadership',
      title: 'Leadership & Management',
      badge: 'Strategic Vision',
      icon: Briefcase,
      desc: 'Executive cohorts focused on developing strategic leadership instincts, organizational decision-making, and high-performance team culture.',
      points: [
        'Leadership effectiveness.',
        'Decision-making and strategic thinking.',
        'Team management and collaboration.',
        'Professional communication.'
      ]
    },
    {
      id: 'Communication',
      title: 'Corporate Communication',
      badge: 'Executive Presence',
      icon: Presentation,
      desc: 'Practical masterclasses in persuasive workplace communication, boardroom presentations, public speaking, and executive writing.',
      points: [
        'Business communication skills.',
        'Presentation and public speaking practice.',
        'Workplace communication.',
        'Professional writing and meeting skills.'
      ]
    },
    {
      id: 'Workshops',
      title: 'Executive Development Workshops',
      badge: 'Workplace Readiness',
      icon: Target,
      desc: 'Intensive modular workshops addressing critical thinking, corporate problem-solving, and cross-functional operational leadership.',
      points: [
        'Problem-solving and critical thinking.',
        'Teamwork and organizational effectiveness.',
        'Professional growth and workplace readiness.',
        'Customized workshop topics.'
      ]
    },
    {
      id: 'CorporateTraining',
      title: 'Corporate Training Programs',
      badge: 'Enterprise Solutions',
      icon: Building2,
      desc: 'Customized organizational training programs structured around enterprise skill audits, cohort workshops, and measured performance milestones.',
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
      desc: 'Understand learning goals, current proficiency, and organizational training requirements.'
    },
    {
      step: '02',
      title: 'Personalized Training Plan',
      desc: 'Recommend relevant modules, schedules, and learning activities.'
    },
    {
      step: '03',
      title: 'Practice & Interactive Sessions',
      desc: 'Conduct structured practice, workshops, exercises, and feedback sessions.'
    },
    {
      step: '04',
      title: 'Progress Review',
      desc: 'Review learning progress and recommend further development milestones.'
    }
  ];

  // Section 5: Who Can Benefit? (4 Audience Cards)
  const audienceCards = [
    {
      title: 'Students Preparing for English Proficiency Tests',
      desc: 'Achieving target test scores for international university admission, visa clearance, and scholarship qualifications.',
      icon: GraduationCap,
      badge: 'Academic Admissions'
    },
    {
      title: 'Healthcare Professionals Preparing for OET',
      desc: 'Nurses, doctors, and healthcare practitioners seeking overseas licensure and regulatory council registration (GMC, NMC, AHPRA).',
      icon: HeartPulse,
      badge: 'Clinical Licensure'
    },
    {
      title: 'University Applicants Preparing for Language Tests',
      desc: 'Meeting conditional admission requirements, clearing prerequisite scorecards, and adapting to global academic environments.',
      icon: BookOpen,
      badge: 'University Ready'
    },
    {
      title: 'Working Professionals and Corporate Leadership Teams',
      desc: 'Advancing executive presence, cross-border corporate communication, strategic negotiation, and team leadership.',
      icon: Briefcase,
      badge: 'Corporate Development'
    }
  ];

  // Section 6: Training Formats (3 Cards)
  const trainingFormats = [
    {
      title: 'Online Training',
      subtitle: 'Live Interactive Virtual Classrooms',
      desc: 'Engage with expert trainers in real-time through secure virtual sessions with flexible morning, evening, or weekend scheduling. Includes recorded review materials and interactive digital mock tests.',
      icon: Laptop
    },
    {
      title: 'Classroom Training',
      subtitle: 'Structured In-Person Cohorts',
      desc: 'Experience immersive, face-to-face instruction in collaborative modern classroom environments. Features in-person diagnostic simulations, group speaking practice, and direct instructor feedback.',
      icon: Users
    },
    {
      title: 'Corporate / On-site Training',
      subtitle: 'Tailored Enterprise Workshops',
      desc: 'Dedicated enterprise training delivered at your corporate premises, executive retreats, or via private enterprise portals. Customized to your team’s organizational objectives and performance KPIs.',
      icon: Building2
    }
  ];

  // Section 8: FAQ (Exact 8 Questions)
  const faqs = [
    {
      q: 'What language preparation programs do you offer?',
      a: 'We provide structured diagnostic preparation programs for all major international English language proficiency tests, including IELTS (Academic & General), OET (Occupational English Test for Healthcare), TOEFL iBT, and the Duolingo English Test (DET).'
    },
    {
      q: 'Do you provide IELTS and OET preparation?',
      a: 'Yes. We offer specialized preparation modules for both IELTS and OET. For OET, our training focuses specifically on medical workplace communication across all four sub-tests (Listening, Reading, Writing, and Speaking) tailored for healthcare professionals seeking international registration.'
    },
    {
      q: 'Are online training sessions available?',
      a: 'Yes. All our language preparation programs and executive seminars are available via live, interactive online classes led by experienced instructors, offering flexible morning, afternoon, and evening batches for busy students and professionals.'
    },
    {
      q: 'Do you offer corporate training programs?',
      a: 'Yes. We partner with organizations, hospitals, educational institutions, and corporate enterprises to deliver bespoke communication, leadership, and workplace development training programs customized to team requirements.'
    },
    {
      q: 'Can training programs be customized?',
      a: 'Absolutely. We conduct an initial diagnostic evaluation to understand your baseline proficiency, scheduling constraints, and specific goals, allowing us to tailor curriculum modules, practice frequency, and study plans.'
    },
    {
      q: 'How can I book a consultation?',
      a: 'You can book a free consultation directly through our online booking form on this page, or connect with our training advisory team via WhatsApp. An advisor will discuss your goals and schedule a diagnostic assessment.'
    },
    {
      q: 'Do you provide executive leadership workshops?',
      a: 'Yes. Our executive seminars cover leadership effectiveness, strategic decision-making, high-impact corporate communication, presentation mastery, and team collaboration for working professionals and managers.'
    },
    {
      q: 'How do I get started?',
      a: 'Getting started is simple: select your interested program above, complete the brief consultation form with your current level and preferred start date, and our admissions advisor will reach out to schedule your preliminary diagnostic test.'
    }
  ];

  // Related Services
  const relatedServices = [
    {
      id: 'intl-consult',
      title: 'International Consulting',
      badge: 'Destination Strategy',
      desc: 'Strategic global education advisory comparing study destinations, tuition structures, and eligibility.',
      route: 'education-intl-consult'
    },
    {
      id: 'college-adm',
      title: 'College Admission Assistance',
      badge: 'Admissions & Cutoffs',
      desc: 'End-to-end college admission assistance, university shortlisting, course selection, and application guidance.',
      route: 'education-college-adm'
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
    }
  ];

  // Structured Data Schema
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'The Revival International - Seminars & Language Preparation',
      'url': 'https://www.therevivalinternational.com/education-exec-seminars-lang',
      'description': 'Executive development seminars, corporate leadership workshops, and certified language test preparation for IELTS, OET, DET, and TOEFL.',
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
    { name: 'Seminars & Language Preparation', url: '/#education-exec-seminars-lang' }
  ];

  return (
    <div className="bg-[#F7F9FC] text-[#263238] font-sans min-h-screen selection:bg-[#C6A45C]/30 selection:text-[#102A43]">
      <EducationSEO
        title="Seminars & Language Preparation | The Revival International"
        description="Executive development seminars, corporate leadership workshops, and certified language test preparation for IELTS, OET, DET, and TOEFL."
        canonicalPath="education-exec-seminars-lang"
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
        keywords="IELTS Preparation, OET Preparation, TOEFL Coaching, Duolingo English Test, Executive Seminars, Corporate Communication, Leadership Development, The Revival International"
      />

      {/* SECTION 1: HERO SECTION (Clean White Background with Premium Corporate Accents) */}
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
              Seminars &amp; Language Preparation
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Heading, Subheading, Description, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102A43]/5 border border-[#102A43]/15 text-[#102A43] text-xs font-bold tracking-widest uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A45C]" />
                <span>MASTER &amp; CERTIFICATION</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#102A43] tracking-tight leading-[1.15]">
                Seminars &amp; Language Preparation
              </h1>

              <p className="text-xl sm:text-2xl font-medium text-[#C6A45C] leading-snug">
                Executive Development, Professional Seminars &amp; Certified Language Test Preparation
              </p>

              <div className="space-y-3 text-[#475569] text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                <p>
                  Enhance professional communication, leadership capabilities, and language proficiency through structured training programs tailored to individual and organizational needs.
                </p>
                <p className="text-sm text-gray-600">
                  The Revival International offers executive development seminars and preparation support for IELTS, OET, DET, and TOEFL, helping students, healthcare professionals, working professionals, and corporate teams prepare for their academic and career goals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    trackCtaClick('hero_book_free_consultation', 'Seminars & Language');
                    scrollToSection('seminars-language-consultation');
                  }}
                  className="px-8 py-4 rounded-xl bg-[#102A43] hover:bg-[#1a3d60] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book Free Consultation</span>
                  <ArrowRight className="w-4 h-4 text-[#C6A45C]" />
                </button>

                <button
                  onClick={() => {
                    trackCtaClick('hero_explore_programs', 'Seminars & Language');
                    scrollToSection('language-test-preparation');
                  }}
                  className="px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-[#102A43] border border-gray-300 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Languages className="w-4 h-4 text-[#C6A45C]" />
                  <span>Explore Our Programs</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#64748B] font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A45C]" /> Certified Instructors
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A45C]" /> Diagnostic Mock Tests
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C6A45C]" /> Corporate Cohorts
                </span>
              </div>
            </div>

            {/* Right Column: Training Visual & Floating Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100 group">
                <img
                  src="/images/seminars_language.jpg"
                  alt="Executive Corporate Training Seminar and Language Classroom Environment"
                  className="w-full h-[380px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Information Card */}
              <div className="absolute -bottom-6 -left-4 sm:-bottom-6 sm:-left-6 bg-white text-[#102A43] rounded-xl p-4 sm:p-5 shadow-2xl border border-gray-200 flex items-center gap-4 max-w-[340px]">
                <div className="w-12 h-12 rounded-lg bg-[#102A43] text-[#C6A45C] flex items-center justify-center shrink-0 shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Professional Training Programs
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#102A43] leading-snug">
                    Language Preparation | Leadership | Corporate Training
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: LANGUAGE TEST PREPARATION PROGRAMS */}
      <section id="language-test-preparation" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Language Test Preparation Programs
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Structured preparation modules for certified English language examinations, led by experienced trainers with diagnostic simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {languagePrograms.map((prog) => {
              const Icon = prog.icon;
              return (
                <div
                  key={prog.id}
                  className="bg-[#F7F9FC] rounded-2xl p-7 border border-gray-200/90 hover:border-[#C6A45C]/60 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#102A43] text-[#C6A45C] flex items-center justify-center shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="bg-white text-[#102A43] border border-gray-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {prog.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#102A43] group-hover:text-[#C6A45C] transition-colors">
                        {prog.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed mt-2">
                        {prog.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-200/80">
                      <ul className="space-y-2">
                        {prog.points.map((pt, i) => (
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
                      onClick={() => handleProgramSelect(`${prog.title}`)}
                      className="w-full py-2.5 px-4 bg-white hover:bg-[#102A43] text-[#102A43] hover:text-white font-bold text-xs rounded-xl border border-gray-300 hover:border-[#102A43] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>{prog.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 3: EXECUTIVE SEMINARS & LEADERSHIP DEVELOPMENT */}
      <section id="executive-seminars" className="py-20 bg-[#F7F9FC] border-y border-gray-200/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Executive Seminars &amp; Leadership Development
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Interactive executive masterclasses, workplace communication seminars, and enterprise management cohorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {executivePrograms.map((prog) => {
              const Icon = prog.icon;
              return (
                <div
                  key={prog.id}
                  className="bg-white rounded-2xl p-7 border border-gray-200 shadow-xs hover:border-[#C6A45C] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#102A43]/5 text-[#102A43] group-hover:bg-[#102A43] group-hover:text-[#C6A45C] transition-colors flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="bg-[#F7F9FC] text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-gray-200">
                        {prog.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#102A43] group-hover:text-[#C6A45C] transition-colors">
                        {prog.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed mt-2">
                        {prog.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <ul className="space-y-2">
                        {prog.points.map((pt, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-2 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A45C] shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6">
                    <button
                      type="button"
                      onClick={() => handleProgramSelect(prog.title)}
                      className="w-full py-2.5 px-4 bg-[#F7F9FC] hover:bg-[#102A43] text-[#102A43] hover:text-white font-bold text-xs rounded-xl border border-gray-200 hover:border-[#102A43] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Enquire Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 4: TRAINING METHODOLOGY */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Our Training Methodology
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              A structured four-step process engineered for rapid skill acquisition and measurable performance improvement.
            </p>
          </div>

          {/* Timeline: Horizontal on Desktop, Vertical on Mobile */}
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-[#102A43]/20 via-[#C6A45C] to-[#102A43]/20 -translate-y-12 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {methodologySteps.map((step) => (
                <div
                  key={step.step}
                  className="bg-[#F7F9FC] rounded-2xl p-6 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#102A43] text-[#C6A45C] font-serif font-bold text-base flex items-center justify-center mb-4 shadow-sm ring-4 ring-white">
                      {step.step}
                    </div>

                    <h3 className="text-base font-serif font-bold text-[#102A43] mb-2 leading-snug">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mt-2 pt-3 border-t border-gray-200/80">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: WHO CAN BENEFIT? */}
      <section className="py-20 bg-[#F7F9FC] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Who Can Benefit?
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Targeted curriculum pathways designed for students, medical practitioners, and corporate leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audienceCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-7 border border-gray-200 shadow-xs hover:border-[#C6A45C]/60 transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#102A43] text-[#C6A45C] flex items-center justify-center shrink-0 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[#102A43]">
                        {card.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#102A43]/5 text-[#102A43] border border-gray-200">
                        {card.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 6: TRAINING FORMATS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Flexible Training Formats
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Adaptable delivery methods structured around busy professional schedules and organizational requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainingFormats.map((format, idx) => {
              const Icon = format.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#F7F9FC] rounded-2xl p-8 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-[#102A43] text-[#C6A45C] flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#102A43]">
                        {format.title}
                      </h3>
                      <p className="text-xs font-bold text-[#C6A45C] uppercase tracking-wider mt-0.5">
                        {format.subtitle}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-200/80">
                      {format.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-200/80 mt-6">
                    <button
                      onClick={() => scrollToSection('seminars-language-consultation')}
                      className="text-xs font-bold text-[#102A43] hover:text-[#C6A45C] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Select This Format</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 7: CONSULTATION FORM */}
      <section id="seminars-language-consultation" className="py-20 bg-[#F7F9FC] border-t border-gray-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Seminars &amp; Language Consultation
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Get personalized training recommendations based on your goals, proficiency level, and preferred training format.
            </p>
          </div>

          <SeminarsLanguageForm
            preselectedProgram={formPreselectedProgram}
            onProgramChange={(prog) => setFormPreselectedProgram(prog)}
          />

        </div>
      </section>

      {/* SECTION 8: FAQ SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Authoritative answers regarding certified test preparation, corporate cohorts, and training logistics.
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

      {/* SECTION 9: RELATED SERVICES */}
      <section className="py-20 bg-[#F7F9FC] border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C6A45C]">
              Comprehensive Academic &amp; Professional Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102A43] mt-1">
              Explore Related Revival International Services
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
            Take the Next Step Towards Professional Excellence.
          </h2>

          <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Whether you are preparing for an international language examination or developing professional capabilities, The Revival International can help you plan your next step.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                trackCtaClick('final_cta_book_free_consultation', 'Seminars & Language');
                scrollToSection('seminars-language-consultation');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C6A45C] hover:bg-[#b5934b] text-[#102A43] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/919003475405?text=Hello%20The%20Revival%20International,%20I%20am%20interested%20in%20Seminars%20and%20Language%20Preparation."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-white/10 text-white border border-[#C6A45C] hover:border-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#C6A45C]" />
              <span>Contact Us on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SeminarsAndLanguagePage;

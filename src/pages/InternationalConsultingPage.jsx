import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EducationSEO } from '../components/EducationSEO';
import { InternationalConsultingForm } from '../components/InternationalConsultingForm';
import ScrollReveal from '../components/ScrollReveal';
import { trackServiceView, trackCtaClick } from '../services/analytics';
import { 
  Globe, Compass, CheckCircle2, ChevronDown, ChevronUp, ArrowRight,
  Calendar, ShieldCheck, Award, FileText, Users, DollarSign, Clock, HelpCircle,
  Sparkles, GraduationCap, Building2, MapPin, Check, BookOpen, Send,
  Briefcase, Landmark, Plane, UserCheck, Layers, FileCheck, ExternalLink,
  Target, Shield, Headphones, HeartHandshake, ChevronRight
} from 'lucide-react';

export const InternationalConsultingPage = () => {
  const { navigateTo } = useApp();
  const [selectedDestinationForForm, setSelectedDestinationForForm] = useState('United Kingdom');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    trackServiceView('intl-consult', 'International Consulting', 'Consulting');
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // SECTION 2: Key Consultation Dimensions (4 Cards)
  const keyDimensions = [
    {
      id: 'dimension-1',
      title: 'Academic Profile & Credential Evaluation',
      description: 'Comprehensive evaluation of academic qualifications, transcripts, grades, English proficiency and admission eligibility.',
      icon: FileText,
      deliverables: [
        'Academic transcript evaluation.',
        'Qualification assessment.',
        'English proficiency requirements.',
        'University eligibility analysis.'
      ]
    },
    {
      id: 'dimension-2',
      title: 'University & Destination Planning',
      description: 'Personalized university selection and destination comparison based on academic profiles and long-term objectives.',
      icon: Compass,
      deliverables: [
        'University shortlisting.',
        'Course comparison.',
        'Country comparison.',
        'Admission requirements.'
      ]
    },
    {
      id: 'dimension-3',
      title: 'Budget, Financial Planning & Scholarships',
      description: 'Transparent multi-year financial planning covering tuition fees, living costs, scholarships and financial requirements.',
      icon: DollarSign,
      deliverables: [
        'Tuition fee estimation.',
        'Living expense planning.',
        'Scholarship opportunities.',
        'Financial documentation guidance.'
      ]
    },
    {
      id: 'dimension-4',
      title: 'Student Visa & Immigration Guidance',
      description: 'Destination-specific student visa guidance, documentation preparation and application requirement awareness.',
      icon: ShieldCheck,
      deliverables: [
        'Visa eligibility guidance.',
        'Documentation checklist.',
        'Financial evidence preparation.',
        'Official immigration requirement guidance.'
      ]
    }
  ];

  // SECTION 3: Four Pillars of International Consulting
  const fourPillars = [
    {
      number: '01',
      title: 'Academic Profile & Credential Evaluation',
      description: 'Systematic diagnostic assessment of secondary or university transcripts, syllabus alignment, subject prerequisites, and language certifications to establish institutional benchmark fit.',
      icon: GraduationCap
    },
    {
      number: '02',
      title: 'Destination & University Comparison',
      description: 'Objective comparative analysis across major global study destinations, analyzing faculty strengths, campus resources, curriculum structures, and long-term academic value.',
      icon: Globe
    },
    {
      number: '03',
      title: 'Budget & Scholarship Planning',
      description: 'Structured multi-year educational expense modeling covering institutional tuition, statutory living allowances, and competitive merit scholarship opportunities.',
      icon: DollarSign
    },
    {
      number: '04',
      title: 'Student Visa & Immigration Guidance',
      description: 'Destination-specific awareness regarding official consular procedures, statutory financial requirements, biometric scheduling, and compliance preparation.',
      icon: ShieldCheck
    }
  ];

  // SECTION 4: Study Destinations (6 Cards with Verified Iconic Landmarks & Flag Images)
  const studyDestinations = [
    {
      id: 'uk',
      name: 'United Kingdom',
      flagCode: 'gb',
      flagUrl: 'https://flagcdn.com/w40/gb.png',
      landmark: 'Oxford & London Corridors',
      image: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?auto=format&fit=crop&w=800&q=80',
      fallbackImage: '/images/international_campus.jpg',
      intro: 'Renowned for prestigious academic traditions, rigorous research standards, and accelerated 1-year Master’s degree programs.',
      studyLevels: ['Undergraduate (BSc / BA / BEng)', 'Postgraduate (1-Year MSc / MA)', 'Doctoral Research (PhD)']
    },
    {
      id: 'usa',
      name: 'United States',
      flagCode: 'us',
      flagUrl: 'https://flagcdn.com/w40/us.png',
      landmark: 'Harvard & Ivy League Corridors',
      image: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&w=800&q=80',
      fallbackImage: '/images/international_campus.jpg',
      intro: 'Global leader in technological innovation, liberal arts interdisciplinary flexibility, and expansive 3-Year STEM OPT career opportunities.',
      studyLevels: ['Bachelor’s Degrees (4-Year)', 'Master of Science / MBA', 'Doctoral Fellowships (PhD)']
    },
    {
      id: 'canada',
      name: 'Canada',
      flagCode: 'ca',
      flagUrl: 'https://flagcdn.com/w40/ca.png',
      landmark: 'Toronto & Vancouver Corridors',
      image: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=800&q=80',
      fallbackImage: '/images/international_campus.jpg',
      intro: 'Celebrated for academic excellence, safe multicultural communities, cooperative work-study terms, and transparent Post-Graduation Work Permits (PGWP).',
      studyLevels: ['Undergraduate Diplomas & Degrees', 'Postgraduate Diplomas', 'Master’s Degrees with Co-op']
    },
    {
      id: 'australia',
      name: 'Australia',
      flagCode: 'au',
      flagUrl: 'https://flagcdn.com/w40/au.png',
      landmark: 'Sydney & Melbourne Corridors',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
      fallbackImage: '/images/international_campus.jpg',
      intro: 'Distinguished by Group of Eight research institutions, vibrant coastal student cities, and generous post-study temporary graduate visas.',
      studyLevels: ['Bachelor’s Degrees (3–4 Years)', 'Master’s Coursework & Research', 'Doctoral Degrees']
    },
    {
      id: 'germany',
      name: 'Germany',
      flagCode: 'de',
      flagUrl: 'https://flagcdn.com/w40/de.png',
      landmark: 'Munich & Heidelberg Corridors',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
      fallbackImage: '/images/international_campus.jpg',
      intro: 'Europe’s industrial and engineering powerhouse, offering top-tier tuition-free or low-cost public education with an expanding catalog of English-taught programs.',
      studyLevels: ['English-Taught Bachelor’s', 'Specialized Master’s (MSc / MEng)', 'Doctoral Research Positions']
    },
    {
      id: 'uae',
      name: 'United Arab Emirates',
      flagCode: 'ae',
      flagUrl: 'https://flagcdn.com/w40/ae.png',
      landmark: 'Dubai & Abu Dhabi Knowledge Hubs',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      fallbackImage: '/images/hero_dubai.png',
      intro: 'A premier regional education hub featuring accredited branch campuses of world-renowned universities within tax-free innovation zones.',
      studyLevels: ['Undergraduate Degree Corridors', 'Specialized Master’s & MSc', 'Executive MBA Programs']
    }
  ];

  // SECTION 5: International Consulting Process (5 Steps)
  const processSteps = [
    {
      number: '01',
      title: 'Initial Discovery & Credential Review',
      description: 'Review academic transcripts, qualifications, test scores and career objectives.'
    },
    {
      number: '02',
      title: 'University Shortlisting & Destination Planning',
      description: 'Prepare a personalized shortlist of suitable universities and destinations.'
    },
    {
      number: '03',
      title: 'Financial Planning & Scholarship Research',
      description: 'Evaluate tuition fees, living expenses and available scholarship opportunities.'
    },
    {
      number: '04',
      title: 'Application Preparation & Submission Guidance',
      description: 'Provide structured application guidance, document checklists and submission timelines.'
    },
    {
      number: '05',
      title: 'Offer Evaluation & Pre-Departure Preparation',
      description: 'Help students understand admission offers, documentation requirements and pre-departure preparation.'
    }
  ];

  // SECTION 6: Why Choose The Revival International? (6 Points)
  const whyChoosePoints = [
    {
      title: 'Personalized Academic Guidance',
      description: 'Every recommendation is customized to your unique academic background, career ambitions, and preferred study formats.',
      icon: UserCheck
    },
    {
      title: 'Structured Consultation Process',
      description: 'A transparent, milestone-driven advisory framework that keeps your timeline organized and ensures no deadlines are missed.',
      icon: Layers
    },
    {
      title: 'Transparent Financial Planning',
      description: 'Realistic multi-year expenditure forecasting covering tuition schedules, living costs, and merit scholarship criteria.',
      icon: DollarSign
    },
    {
      title: 'Global Destination Knowledge',
      description: 'Deep familiarity with the higher education systems, admissions criteria, and student environments across key global study hubs.',
      icon: Globe
    },
    {
      title: 'Dedicated Advisory Support',
      description: 'Personalized one-to-one consultation sessions with experienced educational advisors committed to your academic aspirations.',
      icon: Headphones
    },
    {
      title: 'Student-Focused Approach',
      description: 'Objective, ethical advisory centered strictly on the student’s long-term academic success and personal well-being.',
      icon: HeartHandshake
    }
  ];

  // SECTION 8: FAQ (8 Exact Questions)
  const faqs = [
    {
      q: 'What is international education consulting?',
      a: 'International education consulting is a professional advisory service that assists prospective students and their families in navigating the complexities of studying abroad. It encompasses academic profile diagnostics, personalized university shortlisting, application dossier preparation, tuition and scholarship planning, and official student visa awareness.'
    },
    {
      q: 'Which countries do you provide study guidance for?',
      a: 'We provide structured consultation and advisory support for leading global study destinations, including the United Kingdom, United States, Canada, Australia, Germany, and the United Arab Emirates. We also advise students on select European university hubs offering English-taught programs.'
    },
    {
      q: 'How do I choose the right university?',
      a: 'Selecting the right university involves analyzing your academic grades, standardized test scores, specific course curriculum preferences, faculty research reputation, campus environment, location, tuition budget, and post-study career goals. Our advisors help you evaluate these parameters objectively to build a balanced shortlist of reach, target, and safe universities.'
    },
    {
      q: 'Can you help with scholarship opportunities?',
      a: 'Yes. We assist students in identifying destination-specific merit scholarships, university-level tuition fee waivers, and international funding opportunities. We guide you on the necessary eligibility criteria, essay requirements, and key deadlines to ensure strong scholarship applications.'
    },
    {
      q: 'What academic documents are required?',
      a: 'Key documentation typically includes official academic transcripts, degree/diploma certificates, proof of English language proficiency (such as IELTS, TOEFL, PTE, or Duolingo), a Statement of Purpose (SOP) or personal essay, letters of recommendation (academic and/or professional), an updated academic resume, and a valid international passport.'
    },
    {
      q: 'Do you provide student visa guidance?',
      a: 'Yes. We provide clear, destination-specific guidance regarding official student visa requirements, including statutory document checklists, proof-of-funds verification, biometric procedures, and consular interview preparation. We ensure students are aware of the latest official immigration policies.'
    },
    {
      q: 'Can parents participate in consultations?',
      a: 'Absolutely. We actively encourage parents and guardians to participate in consultation sessions. Higher education planning is a significant family decision involving academic, personal, and financial commitments, and family participation ensures clarity and shared confidence.'
    },
    {
      q: 'How can I book an international consultation?',
      a: 'You can book a free consultation directly through our online booking form on this page. Simply complete your personal details, academic background, preferred study destination, and select your preferred meeting date, time, and format (Online Meeting, WhatsApp, or Phone Call).'
    }
  ];

  // Structured Data Schema
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'The Revival International',
      'url': 'https://www.therevivalinternational.com/international-consulting',
      'description': 'Strategic global education advisory and destination planning across the UK, USA, Canada, Australia, Germany, and UAE.',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Dubai',
        'addressRegion': 'Dubai',
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

  const handleExploreDestination = (destName) => {
    setSelectedDestinationForForm(destName);
    scrollToSection('consultation-booking');
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/#services' },
    { name: 'International Consulting', url: '/#international-consulting' }
  ];

  return (
    <div className="bg-[#F7F9FC] text-[#263238] font-sans min-h-screen selection:bg-[#C6A45C]/30 selection:text-[#102A43]">
      <EducationSEO
        title="International Education Consultants | The Revival International"
        description="Get personalized international education guidance with university selection, academic evaluation, scholarship planning and student visa advisory."
        canonicalPath="international-consulting"
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
        keywords="International Education Consultants, International Education Consulting, Global Education Advisory, Study Abroad Consultants, University Admission Guidance, International University Selection, Study Destination Planning, Scholarship Guidance, Student Visa Guidance"
      />

      {/* SECTION 1: HERO BANNER (Clean White Background with Premium Corporate Accents) */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 bg-white border-b border-gray-200/80">
        {/* Subtle Decorative Architectural Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#102A43_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C6A45C]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium">
            <button 
              onClick={() => navigateTo('home')} 
              className="hover:text-[#102A43] transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <button 
              onClick={() => navigateTo('services')} 
              className="hover:text-[#102A43] transition-colors"
            >
              Services
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#C6A45C] font-semibold">
              International Consulting
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Heading, Subheading, Description, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Small Label */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102A43]/5 border border-[#102A43]/15 text-[#102A43] text-xs font-bold tracking-widest uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A45C]" />
                <span>INTERNATIONAL EDUCATION ADVISORY</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-[#102A43] tracking-tight leading-[1.15]">
                International Consulting
              </h1>

              {/* Subheading */}
              <p className="text-xl sm:text-2xl font-medium text-[#C6A45C] leading-snug">
                Strategic Global Education Advisory & Destination Planning
              </p>

              {/* Description */}
              <p className="text-[#475569] text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Navigate international education opportunities with personalized guidance on university selection, admission requirements, scholarships, financial planning, and global study destinations.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    trackCtaClick('hero_book_free_consultation', 'International Consulting');
                    scrollToSection('consultation-booking');
                  }}
                  className="px-8 py-4 rounded-xl bg-[#102A43] hover:bg-[#1a3d60] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Book Free Consultation</span>
                  <ArrowRight className="w-4 h-4 text-[#C6A45C]" />
                </button>

                <button
                  onClick={() => {
                    trackCtaClick('hero_explore_study_destinations', 'International Consulting');
                    scrollToSection('study-destinations');
                  }}
                  className="px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-[#102A43] border border-gray-300 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Compass className="w-4 h-4 text-[#C6A45C]" />
                  <span>Explore Study Destinations</span>
                </button>
              </div>

              {/* Trust Subtext */}
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

            {/* Right Column: High-Quality International Campus Image & Floating Card */}
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

              {/* Floating Card: Personalized Global Education Advisory */}
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

      {/* SECTION 2: KEY CONSULTATION DIMENSIONS */}
      <section id="consultation-dimensions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Key Consultation Dimensions
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Core parameters evaluated across international education advisory engagements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {keyDimensions.map((dimension) => {
              const IconComponent = dimension.icon;
              return (
                <div 
                  key={dimension.id}
                  className="bg-[#F7F9FC] rounded-2xl p-8 border border-gray-200/90 hover:border-[#C6A45C]/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#102A43] text-[#C6A45C] flex items-center justify-center mb-6 shadow-sm">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-serif font-bold text-[#102A43] mb-3">
                      {dimension.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {dimension.description}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-gray-200/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#102A43] mb-3">
                      Key Deliverables:
                    </div>
                    <ul className="space-y-2">
                      {dimension.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-[#C6A45C] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 3: FOUR PILLARS OF INTERNATIONAL CONSULTING */}
      <section id="four-pillars" className="py-20 bg-[#F7F9FC] border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Four Pillars of International Consulting
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              A structured advisory methodology delivering guidance from academic evaluation to pre-departure planning.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fourPillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <div
                  key={pillar.number}
                  className="bg-white rounded-2xl p-7 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-serif font-extrabold text-[#C6A45C]/40 group-hover:text-[#C6A45C] transition-colors">
                      {pillar.number}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-[#102A43]/5 text-[#102A43] group-hover:bg-[#102A43] group-hover:text-[#C6A45C] transition-colors flex items-center justify-center">
                      <PillarIcon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#102A43] mb-3 group-hover:text-[#C6A45C] transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="h-1 w-8 bg-[#C6A45C] rounded-full mt-5 group-hover:w-full transition-all duration-300" />
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 4: STUDY DESTINATIONS (Iconic Real Places & Flags) */}
      <section id="study-destinations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Explore Global Study Destinations
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Discover leading international education destinations and explore opportunities aligned with your academic goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studyDestinations.map((dest) => (
              <div
                key={dest.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Destination Campus / Iconic Landmark Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                    <img
                      src={dest.image}
                      alt={`${dest.name} - ${dest.landmark}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = dest.fallbackImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Country Real Flag Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-xs font-bold text-gray-900 border border-gray-100">
                      <img 
                        src={dest.flagUrl} 
                        alt={`${dest.name} Flag`} 
                        className="w-4 h-3 object-cover rounded-xs shadow-2xs" 
                        loading="lazy"
                      />
                      <span>{dest.name}</span>
                    </div>

                    {/* Iconic Landmark Tag */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#C6A45C]" />
                      <span>{dest.landmark}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-[#102A43] mb-2">
                      {dest.name}
                    </h3>
                    
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                      {dest.intro}
                    </p>

                    {/* Popular Study Levels */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Popular Study Levels:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.studyLevels.map((lvl, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-[#F7F9FC] text-gray-700 px-2.5 py-1 rounded-md border border-gray-200 font-medium"
                          >
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explore Destination Action */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleExploreDestination(dest.name)}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#102A43] text-[#102A43] bg-white hover:bg-[#102A43] hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-xs"
                  >
                    <span>Explore Destination</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 5: INTERNATIONAL CONSULTING PROCESS */}
      <section id="consulting-process" className="py-20 bg-[#F7F9FC] border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Our International Consulting Process
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              A structured five-stage methodology designed to ensure informed academic, financial and application decisions.
            </p>
          </div>

          {/* Desktop Horizontal Timeline & Mobile Vertical Timeline */}
          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-[#102A43]/20 via-[#C6A45C] to-[#102A43]/20 -translate-y-12 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
              {processSteps.map((step) => (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Step Number Circle */}
                    <div className="w-12 h-12 rounded-full bg-[#102A43] text-[#C6A45C] font-serif font-bold text-base flex items-center justify-center mb-4 shadow-sm ring-4 ring-white">
                      {step.number}
                    </div>

                    <h3 className="text-base font-serif font-bold text-[#102A43] mb-2 leading-snug">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mt-2 pt-3 border-t border-gray-100">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: WHY CHOOSE THE REVIVAL INTERNATIONAL? */}
      <section id="why-choose" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Why Choose The Revival International?
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Dedicated to unbiased, structured, and comprehensive advisory across global education pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChoosePoints.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#F7F9FC] rounded-2xl p-7 border border-gray-200/80 hover:border-[#C6A45C]/50 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#102A43] text-[#C6A45C] flex items-center justify-center mb-5 shadow-sm">
                    <IconComp className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#102A43] mb-2">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 7: CONSULTATION BOOKING */}
      <section id="consultation-booking" className="py-20 bg-[#F7F9FC] border-t border-gray-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Book Your International Consultation
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Start your international education journey with personalized guidance from our advisory team.
            </p>
          </div>

          {/* Three-Step Booking Form Component */}
          <InternationalConsultingForm 
            preselectedDestination={selectedDestinationForForm}
            onDestinationChange={(newDest) => setSelectedDestinationForForm(newDest)}
          />

        </div>
      </section>

      {/* SECTION 8: FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102A43] tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-[#C6A45C] mx-auto my-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-600">
              Authoritative answers to common questions about international study consultations and procedures.
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
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-serif font-semibold text-[#102A43] text-base hover:text-[#C6A45C] transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">
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

      {/* SECTION 9: FINAL CTA */}
      <section className="py-20 bg-[#102A43] text-white relative overflow-hidden">
        {/* Subtle decorative gold circle */}
        <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[#C6A45C]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#C6A45C]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-white mb-4 tracking-tight">
            Your Global Education Journey Starts Here.
          </h2>

          <p className="text-gray-200 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Get personalized guidance to make informed decisions about your international education opportunities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                trackCtaClick('final_cta_book_free_consultation', 'International Consulting');
                scrollToSection('consultation-booking');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#C6A45C] hover:bg-[#b5934b] text-[#102A43] font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Book Your Free Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                trackCtaClick('final_cta_contact_team', 'International Consulting');
                navigateTo('contact');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-white/10 text-white border border-[#C6A45C] hover:border-white font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Contact Our Advisory Team</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default InternationalConsultingPage;

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EDUCATION_SERVICES_DETAILED, getEducationServiceById, getEducationServiceBySlug } from '../data/educationServicesData';
import { EducationSEO } from '../components/EducationSEO';
import { EducationEnquiryModal } from '../components/EducationEnquiryModal';
import ScrollReveal from '../components/ScrollReveal';
import { trackServiceView, trackCtaClick } from '../services/analytics';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, 
  HelpCircle, FileText, Users, Compass, Globe, Sparkles, Building2, 
  Phone, Mail, Calendar, ShieldCheck, Award, GraduationCap, School, 
  Plane, Languages
} from 'lucide-react';

const iconMap = {
  'Globe': Globe,
  'GraduationCap': GraduationCap,
  'Compass': Compass,
  'Plane': Plane,
  'School': School,
  'Languages': Languages
};

import { InternationalConsultingPage } from './InternationalConsultingPage';
import { InternationalAdmissionsPage } from './InternationalAdmissionsPage';
import { CollegeAdmissionsPage } from './CollegeAdmissionsPage';
import { SeminarsAndLanguagePage } from './SeminarsAndLanguagePage';
import { StudentAcademyPage } from './StudentAcademyPage';
import { CourseGuidanceCatalogue } from '../components/CourseGuidanceCatalogue';

export const EducationServiceDetail = ({ serviceId }) => {
  const { navigateTo } = useApp();

  const cleanId = (serviceId || '').split('?')[0];
  const service = getEducationServiceById(cleanId) || getEducationServiceBySlug(cleanId) || EDUCATION_SERVICES_DETAILED[0];

  if (service.id === 'intl-consult' || cleanId === 'intl-consult' || cleanId === 'international-consulting') {
    return <InternationalConsultingPage />;
  }

  if (service.id === 'intl-adm' || service.id === 'international-admissions' || cleanId === 'intl-adm' || cleanId === 'international-admissions') {
    return <InternationalAdmissionsPage />;
  }

  if (service.id === 'college-adm' || service.id === 'college-admission' || service.slug === 'college-admission-assistance' || cleanId === 'college-adm') {
    return <CollegeAdmissionsPage />;
  }

  if (service.id === 'school-academy' || cleanId === 'school-academy' || cleanId === 'student-academy' || cleanId === 'academy-for-school-students') {
    return <StudentAcademyPage />;
  }

  if (
    service.id === 'exec-seminars-lang' ||
    service.slug === 'executive-seminars-and-language-test-preparation' ||
    service.id === 'seminars-and-language' ||
    service.slug === 'seminars-and-language'
  ) {
    return <SeminarsAndLanguagePage />;
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [modalServiceId, setModalServiceId] = useState(service.id);
  const [selectedSubProgram, setSelectedSubProgram] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedCourseObj, setSelectedCourseObj] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const IconComponent = iconMap[service.icon] || GraduationCap;

  const isCareerGuidance = 
    service.id === 'school-career' || 
    service.slug === 'school-student-career-guidance' ||
    cleanId === 'school-career' || 
    cleanId === 'career-guidance';

  useEffect(() => {
    if (service && service.id) {
      setModalServiceId(service.id);
      trackServiceView(service.id, service.title, service.category || 'Education');
    }
  }, [service?.id]);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  const relatedServices = (service.relatedServiceIds || [])
    .map(id => getEducationServiceById(id))
    .filter(Boolean);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': service.title,
      'serviceType': 'Academic and Education Advisory',
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'Revival International Academic Advisory',
        'url': `https://www.revivalinternational.com/education/${service.slug || service.id}`,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Dubai',
          'addressCountry': 'AE'
        }
      },
      'description': service.shortDescription,
      'areaServed': ['United Arab Emirates', 'GCC', 'Worldwide']
    }
  ];

  if (service.faqs && service.faqs.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': service.faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.a
        }
      }))
    });
  }

  return (
    <div id={isCareerGuidance ? "career-guidance-page" : undefined} className="space-y-16 pb-20">
      <EducationSEO
        title={`${isCareerGuidance ? 'Career Guidance' : service.title} | Academic & University Advisory Dubai`}
        description={isCareerGuidance 
          ? 'Make informed decisions about your education and career with personalized academic guidance. Explore undergraduate (UG), postgraduate (PG), and professional courses across multiple departments.'
          : `${service.shortDescription} Comprehensive admissions roadmap, credential auditing, and certified mentorship in Dubai.`
        }
        canonicalPath={`education/${service.slug || service.id}`}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Academic Advisory', item: '/education' },
          { name: isCareerGuidance ? 'Career Guidance' : service.title, item: `/education/${service.slug || service.id}` }
        ]}
        structuredData={structuredData}
      />

      {/* Breadcrumb Navigation Bar */}
      <div className="bg-white/80 dark:bg-navy-950/80 border-b border-slate-200 dark:border-navy-800 backdrop-blur-sm sticky top-[73px] z-30">
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
            <span className="text-gold-600 dark:text-gold-400 font-bold truncate max-w-[200px] sm:max-w-none">
              {isCareerGuidance ? 'Career Guidance' : service.title}
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

        {/* Hero Section */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 md:p-12 shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Subtitle, Description, CTAs, and Key Stats */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                {!isCareerGuidance && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-gold-500/30">
                      {service.badge}
                    </span>
                    <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-500/30">
                      Verified Service • {service.category}
                    </span>
                  </div>
                )}

                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white leading-tight">
                  {isCareerGuidance ? 'Career Guidance' : service.title}
                </h1>

                <p className="text-base sm:text-lg text-gold-600 dark:text-gold-400 font-serif italic">
                  {isCareerGuidance 
                    ? 'Explore Academic Pathways & Discover Your Future Career' 
                    : service.tagline
                  }
                </p>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {isCareerGuidance 
                    ? 'Make informed decisions about your education and career with personalized academic guidance. Explore undergraduate (UG), postgraduate (PG), and professional courses across multiple departments, understand eligibility requirements, compare specializations, and discover career opportunities aligned with your interests and goals.'
                    : service.heroDescription
                  }
                </p>

                {/* CTAs */}
                <div className={`flex flex-wrap gap-3.5 items-center ${isCareerGuidance ? 'pt-1 sm:pt-2' : 'pt-3'}`}>
                  {!isCareerGuidance && (
                    <button
                      onClick={() => {
                        trackCtaClick('Book Free Consultation', 'service_detail_hero', service.id);
                        setSelectedSubProgram(null);
                        setModalOpen(true);
                      }}
                      className="px-6 py-3.5 bg-gold-shimmer text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Free Consultation</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const targetId = isCareerGuidance ? 'course-guidance-catalogue' : 'workflow-section';
                      const el = document.getElementById(targetId);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-3.5 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:text-navy-900 dark:hover:text-white font-bold text-xs sm:text-sm rounded-xl transition border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-gold-500" />
                    <span>{isCareerGuidance ? 'Explore Courses ↓' : 'Explore Methodology ↓'}</span>
                  </button>
                </div>

                {/* Key Quick Stats */}
                {service.keyStats && service.keyStats.length > 0 && !isCareerGuidance && service.id !== 'school-academy' && (
                  <div className="pt-6 border-t border-slate-100 dark:border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {service.keyStats.map((stat, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{stat.label}</p>
                        <p className="text-xs sm:text-sm font-black text-navy-900 dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Premium Visual Card (matching International Consulting) */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-gold-500/30 group">
                  <img
                    src={service.id === 'college-adm' ? '/images/international_admissions.jpg' : '/images/academy_students.jpg'}
                    alt={isCareerGuidance ? 'Career Guidance' : service.title}
                    className="w-full h-72 sm:h-80 md:h-96 object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent" />

                  {/* Floating Overlay Badge / Banner Card */}
                  <div className="absolute bottom-4 left-4 right-4">
                    {isCareerGuidance ? (
                      <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md p-4 sm:p-4.5 rounded-xl border border-gold-500/30 shadow-lg space-y-2">
                        <div>
                          <h3 className="font-serif text-lg sm:text-xl font-extrabold text-[#0B1B33] dark:text-white leading-tight">
                            Explore Your Future
                          </h3>
                          <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-1.5">
                            Discover courses, compare degrees, and find an academic pathway aligned with your ambitions.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-navy-800">
                          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-400 block">
                            EXPLORE • PLAN • ACHIEVE
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/95 dark:bg-navy-900/95 backdrop-blur-md p-3.5 rounded-xl border border-gold-500/30 shadow-lg space-y-1.5">
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100 dark:border-navy-800">
                          <span className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-gold-500" />
                            Verified Admissions Support
                          </span>
                          <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded">
                            UG & PG Tracks
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-snug">
                          Direct application portal coordination, document verification, and offer tracking.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Sub-Programmes (Especially prominent for Executive Seminars & Language Training) */}
        {service.subProgrammes && service.subProgrammes.length > 0 && (
          <ScrollReveal>
            <div className="space-y-6">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Specialized Modules
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                  Available Program & Test Modules
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Select a specific track below for targeted diagnostic preparation or corporate executive training.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.subProgrammes.map((sub) => (
                  <div
                    key={sub.id}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="bg-gold-500/15 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {sub.badge}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">#{sub.id}</span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                        {sub.title}
                      </h3>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {sub.description}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 text-[11px] space-y-1">
                        <span className="font-bold text-navy-900 dark:text-white">Target Candidates: </span>
                        <span className="text-slate-600 dark:text-slate-400">{sub.audience}</span>
                      </div>

                      {sub.features && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Curriculum Highlights:</p>
                          <ul className="space-y-1">
                            {sub.features.map((f, i) => (
                              <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setSelectedSubProgram(sub.title);
                          setModalOpen(true);
                        }}
                        className="w-full py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition text-center"
                      >
                        Inquire for {sub.title}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Key Benefits Grid or Course Guidance Catalogue */}
        {service.id === 'school-career' ? (
          <CourseGuidanceCatalogue 
            onInquire={(course) => {
              const streamPart = course.streamName ? ` [${course.streamName}]` : (course.department ? ` [${course.department}]` : '');
              setSelectedSubProgram(`${course.abbreviation ? course.abbreviation + ' - ' : ''}${course.name}${streamPart}`);
              setSelectedLevel(course.level === 'PG' ? 'Postgraduate (Master Degree / MBA)' : 'Undergraduate (Bachelor Degree)');
              setSelectedCourseObj(course);
              setModalOpen(true);
            }}
          />
        ) : (
          <ScrollReveal>
            <div className="space-y-8">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Strategic Advantages
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                  Key Benefits & Service Highlights
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  How our certified educational advisors deliver measurable outcomes and admissions clarity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(service.keyBenefits || []).map((benefit, idx) => (
                  <div 
                    key={idx}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-6 space-y-3 hover:border-gold-500 transition duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center font-bold font-serif text-lg">
                      0{idx + 1}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Who Is It For */}
        {!isCareerGuidance && (
          <ScrollReveal>
            <div className="glass-card bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-10 space-y-6">
              <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 pb-2 border-b border-slate-200 dark:border-navy-800">
                <Users className="w-6 h-6" />
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                    Intended Audience & Eligibility
                  </h2>
                  <p className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-bold tracking-widest">Candidate Profile Matching</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {service.targetAudience}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {service.whoIsItFor.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* How The Service Works (Step-by-Step Workflow) */}
        <ScrollReveal>
          <div id="workflow-section" className="space-y-8 scroll-mt-24">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Advisory Methodology
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                How the Process Works
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                A structured 4-stage execution model designed to ensure transparency, compliance, and deadline discipline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {service.howItWorks.map((step) => (
                <div 
                  key={step.step}
                  className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 space-y-3 relative hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="w-7 h-7 rounded-full bg-gold-500 text-navy-950 font-extrabold text-xs flex items-center justify-center shadow-gold-glow">
                      {step.step}
                    </span>
                    <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                    Stage {step.step} of 4
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Documentation & Checklist */}
        <ScrollReveal>
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 rounded-3xl p-6 sm:p-10 space-y-6 shadow-glass">
            <div className="flex items-center space-x-3 text-gold-600 dark:text-gold-400 pb-2 border-b border-slate-100 dark:border-navy-800">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                  Documentation & Requirements Checklist
                </h2>
                <p className="text-[10px] uppercase text-gold-600 dark:text-gold-400 font-bold tracking-widest">
                  Required Application Dossier
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              Prepare the following verified credentials to expedite your consultation and admissions file evaluation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {service.requiredDocuments.map((doc, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* FAQs Accordion */}
        {!isCareerGuidance && (
          <ScrollReveal>
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Questions Answered
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {service.faqs.map((faq, idx) => (
                  <div 
                    key={idx}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={openFaqIndex === idx}
                      className="w-full text-left p-4 sm:p-5 flex justify-between items-center text-xs sm:text-sm font-bold text-navy-900 dark:text-white hover:text-gold-500 transition focus:outline-none"
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
        )}

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <ScrollReveal>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 dark:border-navy-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 dark:text-gold-400">
                    Integrated Offerings
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy-900 dark:text-white">
                    Related Academic Advisory Services
                  </h3>
                </div>
                <button
                  onClick={() => navigateTo('education')}
                  className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedServices.map((rel) => (
                  <div
                    key={rel.id}
                    className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500 transition duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {rel.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">#{rel.id}</span>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {rel.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center">
                      <button
                        onClick={() => navigateTo(`education-${rel.id}`)}
                        className="text-xs font-bold text-navy-900 dark:text-gold-400 hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setModalServiceId(rel.id);
                          setSelectedSubProgram(null);
                          setModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-gold-shimmer text-navy-950 font-bold text-[11px] rounded-lg shadow-gold-glow hover:opacity-95 transition"
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Global Dubai Office / Contact Footer Banner */}
        {!isCareerGuidance && (
          <ScrollReveal>
            <div className="glass-card bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-gold-500/40 rounded-3xl p-8 sm:p-10 text-white space-y-6 shadow-luxury">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="bg-gold-500/20 text-gold-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Dubai Headquarters Advisory Desk
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                    Ready to Shape Your Academic Future?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connect with our licensed education consultants in Dubai or schedule a dedicated virtual appointment for your family.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 shrink-0">
                  <button
                    onClick={() => {
                      trackCtaClick('Schedule Appointment', 'service_detail_bottom_banner', service.id);
                      setSelectedSubProgram(null);
                      setModalOpen(true);
                    }}
                    className="px-6 py-3 bg-gold-shimmer text-navy-950 font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition"
                  >
                    Schedule Appointment
                  </button>
                  <button
                    onClick={() => navigateTo('contact')}
                    className="px-5 py-3 bg-white/10 text-white hover:bg-white/20 font-bold text-xs rounded-xl transition border border-white/20"
                  >
                    Visit Dubai Office
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>+971 4 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>education@revivalinternational.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Rolex Tower, Business Bay, Dubai</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

      </div>

      {/* Reusable Consultation Enquiry Modal */}
      <EducationEnquiryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSubProgram(null);
          setSelectedLevel(null);
          setSelectedCourseObj(null);
        }}
        preselectedServiceId={modalServiceId}
        preselectedSubProgram={selectedSubProgram}
        preselectedLevel={selectedLevel}
        selectedCourse={selectedCourseObj}
      />
    </div>
  );
};

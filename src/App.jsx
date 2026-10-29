import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIResumeAnalyzerModal } from './components/AIResumeAnalyzerModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { ResumeBuilderModal } from './components/ResumeBuilderModal';
import { AIChatbotDrawer } from './components/AIChatbotDrawer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CookieConsent } from './components/CookieConsent';

import { Home } from './pages/Home';
import { AboutUs } from './pages/AboutUs';
import { Services } from './pages/Services';
import { Industries } from './pages/Industries';
import { JobsPage } from './pages/JobsPage';
import { EmployerPortal } from './pages/EmployerPortal';
import { CandidatePortal } from './pages/CandidatePortal';
import { VisaEligibilityPage } from './pages/VisaEligibilityPage';
import { BackgroundVerificationPage } from './pages/BackgroundVerificationPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { EducationDirectory } from './pages/EducationDirectory';
import { EducationServiceDetail } from './pages/EducationServiceDetail';
import { InternationalConsultingPage } from './pages/InternationalConsultingPage';
import { InternationalAdmissionsPage } from './pages/InternationalAdmissionsPage';
import { CollegeAdmissionsPage } from './pages/CollegeAdmissionsPage';
import { SeminarsAndLanguagePage } from './pages/SeminarsAndLanguagePage';
import { getEducationServiceById, getEducationServiceBySlug } from './data/educationServicesData';
import { NotFound } from './pages/NotFound';
import { UnifiedAuthModal } from './components/UnifiedAuthModal';
import { CrmApp } from './crm/CrmApp';
import { ErpApp } from './erp/ErpApp';

export function App() {
  const { activeTab } = useApp();

  const isCrmRoute = activeTab === 'crm' || 
    (typeof window !== 'undefined' && (window.location.pathname.replace(/^\/+|\/+$/g, '').startsWith('crm') || window.location.hash === '#crm'));

  const isErpRoute = activeTab === 'superadmin-erp' || activeTab === 'erp' || 
    (typeof window !== 'undefined' && (
      window.location.pathname.replace(/^\/+|\/+$/g, '').startsWith('superadmin-erp') || 
      window.location.pathname.replace(/^\/+|\/+$/g, '').startsWith('erp') || 
      window.location.hash === '#erp' ||
      window.location.hash === '#superadmin-erp'
    ));

  if (isErpRoute) {
    return <ErpApp />;
  }

  if (isCrmRoute) {
    return <CrmApp />;
  }

  const isStudentAcademyPage = Boolean(
    activeTab && (
      activeTab === 'education-school-academy' ||
      activeTab === 'school-academy' ||
      activeTab === 'student-academy' ||
      activeTab === 'education-student-academy' ||
      activeTab === 'education/school-academy' ||
      activeTab === 'education/student-academy' ||
      activeTab === 'academy-for-school-students' ||
      activeTab === 'education/academy-for-school-students' ||
      activeTab.includes('school-academy') ||
      activeTab.includes('student-academy') ||
      activeTab.includes('academy-for-school-students')
    )
  );

  const isCareerGuidancePage = Boolean(
    activeTab && (
      activeTab === 'education-school-career' ||
      activeTab === 'school-career' ||
      activeTab === 'education/school-career' ||
      activeTab === 'education-career-guidance' ||
      activeTab === 'career-guidance' ||
      activeTab === 'education/career-guidance' ||
      activeTab === 'school-student-career-guidance' ||
      activeTab === 'education-school-student-career-guidance' ||
      activeTab === 'education/school-student-career-guidance' ||
      activeTab.includes('school-career') ||
      activeTab.includes('career-guidance') ||
      activeTab.includes('school-student-career-guidance')
    )
  );

  const renderCurrentPage = () => {
    // Dedicated Academic & Education Advisory Routes
    if (activeTab === 'education') {
      return <EducationDirectory />;
    }
    if (
      activeTab === 'education-intl-consult' ||
      activeTab === 'international-consulting' ||
      activeTab === 'education/international-consulting' ||
      activeTab === 'education/intl-consult'
    ) {
      return <InternationalConsultingPage />;
    }
    if (
      activeTab === 'education-intl-adm' ||
      activeTab === 'international-admissions' ||
      activeTab === 'education/international-admissions' ||
      activeTab === 'education/intl-adm'
    ) {
      return <InternationalAdmissionsPage />;
    }
    if (
      activeTab === 'education-college-adm' ||
      activeTab === 'education-college-admission' ||
      activeTab === 'college-adm' ||
      activeTab === 'college-admission' ||
      activeTab === 'college-admission-assistance' ||
      activeTab === 'education/college-admission-assistance' ||
      activeTab === 'education/college-adm'
    ) {
      return <CollegeAdmissionsPage />;
    }
    if (
      activeTab === 'education-exec-seminars-lang' ||
      activeTab === 'seminars-and-language' ||
      activeTab === 'education/seminars-and-language' ||
      activeTab === 'education/executive-seminars-and-language-test-preparation' ||
      activeTab === 'executive-seminars-and-language-test-preparation'
    ) {
      return <SeminarsAndLanguagePage />;
    }
    if (activeTab && (activeTab.startsWith('education-') || activeTab.startsWith('education/'))) {
      const baseTab = activeTab.split('?')[0];
      const raw = baseTab.replace(/^education[-/]/, '');
      if (raw === 'intl-consult' || raw === 'international-consulting') {
        return <InternationalConsultingPage />;
      }
      if (raw === 'intl-adm' || raw === 'international-admissions') {
        return <InternationalAdmissionsPage />;
      }
      if (raw === 'college-adm' || raw === 'college-admission' || raw === 'college-admission-assistance') {
        return <CollegeAdmissionsPage />;
      }
      if (raw === 'school-academy' || raw === 'academy-for-school-students' || raw === 'student-academy') {
        return <EducationServiceDetail serviceId="school-academy" />;
      }
      if (
        raw === 'exec-seminars-lang' ||
        raw === 'seminars-and-language' ||
        raw === 'executive-seminars-and-language-test-preparation'
      ) {
        return <SeminarsAndLanguagePage />;
      }
      const srv = getEducationServiceBySlug(raw) || getEducationServiceById(raw);
      if (srv) {
        return <EducationServiceDetail serviceId={srv.id} />;
      }
      return <EducationServiceDetail serviceId={raw} />;
    }

    switch (activeTab) {
      case 'school-academy':
      case 'student-academy':
        return <EducationServiceDetail serviceId="school-academy" />;
      case 'erp':
        return <ErpApp />;
      case 'crm':
        return <CrmApp />;
      case 'about':
        return <AboutUs />;
      case 'services':
        return <Services />;
      case 'industries':
        return <Industries />;
      case 'jobs':
        return <JobsPage />;
      case 'employers':
        return <EmployerPortal />;
      case 'candidates':
        return <CandidatePortal />;
      case 'visa-eligibility':
        return <VisaEligibilityPage />;
      case 'background-verification':
        return <BackgroundVerificationPage />;
      case 'contact':
        return <ContactUsPage />;
      case 'home':
      case '':
      case undefined:
      case null:
        return <Home />;
      default:
        return <NotFound />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-gold-500 selection:text-white">
      <Navbar />
      
      <main className="flex-grow">
        {renderCurrentPage()}
      </main>

      <Footer hideNewsletter={isCareerGuidancePage || isStudentAcademyPage} />

      {/* Global Interactive Modals & Floating Widgets */}
      <UnifiedAuthModal />
      <AIResumeAnalyzerModal />
      <PaymentGatewayModal />
      <ResumeBuilderModal />
      <AIChatbotDrawer />
      <FloatingWhatsApp />
      <CookieConsent />
    </div>
  );
}

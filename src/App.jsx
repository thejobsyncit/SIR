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
    if (activeTab && (activeTab.startsWith('education-') || activeTab.startsWith('education/'))) {
      const baseTab = activeTab.split('?')[0];
      const raw = baseTab.replace(/^education[-/]/, '');
      if (raw === 'intl-consult' || raw === 'international-consulting') {
        return <InternationalConsultingPage />;
      }
      if (raw === 'school-academy' || raw === 'academy-for-school-students' || raw === 'student-academy') {
        return <EducationServiceDetail serviceId="school-academy" />;
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

      <Footer />

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

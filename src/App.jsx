<<<<<<< HEAD
import React from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
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

<<<<<<< HEAD
export function App() {
  const { activeTab } = useApp();

=======
import { CrmApp } from './crm/CrmApp';

export function App() {
  const { activeTab } = useApp();
  const [isCrmRoute, setIsCrmRoute] = useState(false);

  useEffect(() => {
    const checkCrmAccess = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      setIsCrmRoute(hash.startsWith('#crm') || path.includes('/crm'));
    };
    checkCrmAccess();
    window.addEventListener('hashchange', checkCrmAccess);
    window.addEventListener('popstate', checkCrmAccess);
    return () => {
      window.removeEventListener('hashchange', checkCrmAccess);
      window.removeEventListener('popstate', checkCrmAccess);
    };
  }, []);

  // Isolated Enterprise CRM Application Mode (Accessible ONLY via /crm or #crm)
  if (isCrmRoute) {
    return <CrmApp />;
  }

  // Public Consultancy Website Mode (Zero CRM Links Visible)
>>>>>>> 07ac5c3a07e2c57e0ebb677f1885544f5b93c946
  const renderCurrentPage = () => {
    switch (activeTab) {
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
      default:
        return <Home />;
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
      <AIResumeAnalyzerModal />
      <PaymentGatewayModal />
      <ResumeBuilderModal />
      <AIChatbotDrawer />
      <FloatingWhatsApp />
      <CookieConsent />
    </div>
  );
}

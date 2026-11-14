import React from 'react';
import LegalPageLayout from './LegalPageLayout';

export const PrivacyPolicyPage = () => {
  return (
    <LegalPageLayout activeLegalId="legal-privacy" title="Privacy Policy">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Introduction & Statutory Scope</h2>
        <p>
          Revival International Consultancy FZ-LLC (&quot;Revival International&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting the privacy, confidentiality, and security of personal data entrusted to us by job seekers, employer representatives, and academic advisory students.
        </p>
        <p>
          This Privacy Policy sets out how we collect, process, store, share, and protect your personal information in accordance with the <strong>United Arab Emirates Federal Decree-Law No. 45 of 2021 on Personal Data Protection (&quot;UAE PDPL&quot;)</strong>, the <strong>India Digital Personal Data Protection Act 2023 (&quot;DPDP Act 2023&quot;)</strong>, and the recruitment standards established by the UAE Ministry of Human Resources and Emiratisation (MOHRE).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Categories of Personal Data Collected</h2>
        <p>Depending on the services you utilize, we may collect and process:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Identity & Demographic Details:</strong> Full name, date of birth, gender, nationality, passport metadata, and professional portrait.</li>
          <li><strong>Contact Information:</strong> Validated telephone/WhatsApp number, verified personal or corporate email address, and residential city/country.</li>
          <li><strong>Employment & Career History:</strong> Curriculum Vitae (CV/resume), employment records, skills, educational credentials, certifications, and current/expected compensation brackets.</li>
          <li><strong>Immigration & Attestation Records:</strong> Visa status, MOHRE labor clearance records, academic attestation copies, and background verification references (strictly with explicit consent).</li>
          <li><strong>Digital Attribution & Device Telemetry:</strong> IP address, device type, browser identifiers, and session timestamps captured during portal usage.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Lawful Basis & Purposes for Processing</h2>
        <p>We process personal information under the following lawful bases:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Explicit Candidate Consent:</strong> For evaluating resumes, matching candidate profiles with vetted employer vacancies, and initiating immigration/visa advisory workflows.</li>
          <li><strong>Contractual Performance:</strong> Fulfilling executive recruitment agreements, corporate manpower outsourcing contracts, or student academic admissions services.</li>
          <li><strong>Legal & Regulatory Compliance:</strong> Complying with UAE MOHRE labor quotas, Emigration Act requirements, and statutory tax obligations.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Zero-Fee Candidate Placement Guarantee</h2>
        <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-xl">
          <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-400">
            Absolute Guarantee: No Placement Fees Are Ever Charged to Job Seekers
          </p>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
            Revival International Consultancy operates under ethical recruitment charters. In compliance with UAE Labor Law and international standards, candidates are NEVER required to pay registration fees, interview fees, CV shortlisting fees, or visa placement charges. All agency recruitment costs are strictly billed to sponsoring corporate employers.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Advisory Nature of AI Features & Human-in-the-Loop</h2>
        <p>
          Our platform incorporates algorithmic matching tools (AI Resume Analyzer, vacancy suitability scoring). In strict compliance with UAE PDPL automated decision-making provisions:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>All AI outputs are strictly advisory recommendations for recruiters and candidates.</li>
          <li>No candidate is rejected or hired solely through automated algorithms.</li>
          <li>A qualified human recruitment consultant conducts an independent human review before any application is progressed, shortlisted, or submitted to an employer client.</li>
          <li>Candidate CVs are never shared with or reused across unverified third parties without express written consent.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Data Retention & Secure Storage</h2>
        <p>
          Candidate records, resumes, and communication logs are stored in secure, encrypted cloud data centers. We retain active candidate dossiers for a period of up to 24 months from the last documented user interaction, after which records are automatically archived or purged unless re-consented.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">7. Your Statutory Rights (UAE PDPL & India DPDP)</h2>
        <p>You have statutory rights regarding your personal data, including:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Right to Access & Portability:</strong> Request a full copy of your registered candidate dossier.</li>
          <li><strong>Right to Rectification:</strong> Correct inaccurate biographical or employment records.</li>
          <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the permanent deletion of your profile, CV, and contact details from our active talent database.</li>
          <li><strong>Right to Withdraw Consent:</strong> Revoke previously granted consent for vacancy matching at any time without penalty.</li>
        </ul>
        <p>
          To exercise your data protection rights, submit a formal request to our appointed Data Protection Officer at: <a href="mailto:compliance@therevivalinternational.com" className="text-gold-500 font-bold hover:underline">compliance@therevivalinternational.com</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;


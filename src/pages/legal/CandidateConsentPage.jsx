import React from 'react';
import LegalPageLayout from './LegalPageLayout';

export const CandidateConsentPage = () => {
  return (
    <LegalPageLayout activeLegalId="legal-consent" title="Candidate Data Consent Notice">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Purpose of This Notice</h2>
        <p>
          This Candidate Data Consent Notice explains the exact conditions under which Revival International Consultancy FZ-LLC collects, evaluates, and securely manages your curriculum vitae (CV/resume) and professional information.
        </p>
        <p>
          By submitting your CV through Quick Apply or creating a candidate account, you provide informed, affirmative consent under Article 5 of the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and Section 6 of the India Digital Personal Data Protection Act 2023.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Scope of Candidate Consent</h2>
        <p>Your consent permits Revival International to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Parse and evaluate your CV against vetted employment vacancies matching your stated career interests.</li>
          <li>Store your candidate profile in our secure talent management system with version-controlled audit logging.</li>
          <li>Contact you via validated telephone, WhatsApp, or email regarding interview schedules, application milestones, and vacancy updates.</li>
          <li>Present an anonymized candidate executive summary to prospective sponsoring employers, followed by full dossier submission upon your confirmed interest.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Non-Reuse & Strict Privacy of Uploaded CVs</h2>
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-400">
            Absolute Guarantee: Zero Unauthorized CV Sharing or Commercial Reuse
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
            Uploaded resumes and CV documents are strictly confidential. We NEVER sell candidate data to marketing aggregators, and we NEVER submit your profile to an employer without prior consultation or confirmation.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Mandatory Human Recruiter Review (No Automated Rejection)</h2>
        <p>
          Our platform utilizes assistive AI tools (AI Resume Analyzer, ATS keyword scoring) to assist candidates and consultants in identifying relevant vacancies. In accordance with ethical AI governance:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>All AI outputs are strictly advisory recommendations.</li>
          <li>Every shortlist and interview recommendation requires human review and sign-off by a licensed recruitment consultant.</li>
          <li>No candidate is rejected, screened out, or disqualified based solely on algorithmic computation.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Consent Recording & Revocation</h2>
        <p>
          When you submit any registration or Quick Apply form, your affirmative consent is timestamped and recorded in our secure compliance ledger along with your IP address, form version, and user ID.
        </p>
        <p>
          You may revoke your consent or request total profile erasure at any time by emailing <a href="mailto:compliance@therevivalinternational.com" className="text-gold-500 font-bold hover:underline">compliance@therevivalinternational.com</a>. Profile erasure requests are actioned within 72 hours.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default CandidateConsentPage;


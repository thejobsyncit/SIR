import React from 'react';
import LegalPageLayout from './LegalPageLayout';

export const TermsOfUsePage = () => {
  return (
    <LegalPageLayout activeLegalId="legal-terms" title="Terms of Use">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Agreement to Terms</h2>
        <p>
          These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;User&quot;, &quot;you&quot;), and Revival International Consultancy FZ-LLC (&quot;Revival International&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), concerning your access to and use of therevivalinternational.com as well as any associated portals, APIs, and services.
        </p>
        <p>
          By accessing the site, creating an account, or submitting an application or enquiry, you acknowledge that you have read, understood, and agreed to be bound by all of these Terms of Use.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Permitted User Profiles & Portal Obligations</h2>
        <p>The platform provides specialized access tiers for three primary user categories:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Job Seekers / Candidates:</strong> Permitted to register verified dossiers, upload current CVs, browse live vacancies, and submit applications. Candidates must represent their credentials truthfully. Misrepresenting qualifications, nationality, or work eligibility is strictly prohibited.</li>
          <li><strong>Employer Clients & Sponsoring Organizations:</strong> Authorized to post verified manpower requisitions, review shortlisted candidate profiles, and schedule panel interviews. Employers agree never to solicit illegal placement fees or withholding of passports from deployed workers.</li>
          <li><strong>Academic Advisory Students & Guardians:</strong> Permitted to access university admissions guidance, book counselling sessions, and register for accredited language preparation programs. Applicants under 18 years of age must furnish verified parent/guardian consent.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Zero-Fee Candidate Placement Clause</h2>
        <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-xl">
          <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-400">
            Absolute Statutory Prohibition on Candidate Charges
          </p>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
            Revival International does not collect, demand, or accept any recruitment fee, deposit, or placement consideration from candidates under any pretext. Any commercial payment transactions on this platform relate strictly to approved corporate employer services or verified student academic advisory packages, as detailed in our Refund Policy.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the platform, source code, databases, software algorithms, audio, video, text, photographs, and graphics on the site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein are owned or licensed by Revival International Consultancy FZ-LLC and are protected by copyright and trademark laws of the United Arab Emirates and international conventions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Advisory Nature of Platform Tools</h2>
        <p>
          Information provided via the Visa Eligibility Checker, AI Resume Analyzer, and salary benchmarking tools is for informational and preliminary guidance purposes only. Official visa eligibility and entry permits are governed exclusively by respective sovereign government immigration authorities (such as the UAE Federal Authority for Identity, Citizenship, Customs and Port Security - ICP, and Ministry of Human Resources and Emiratisation - MOHRE).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Governing Law & Dispute Resolution</h2>
        <p>
          These Terms of Use and your use of the website are governed by and construed in accordance with the laws of the Emirate of Dubai and the applicable Federal Laws of the United Arab Emirates. Any dispute arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts of Dubai, UAE.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default TermsOfUsePage;


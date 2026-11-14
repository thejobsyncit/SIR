import React from 'react';
import LegalPageLayout from './LegalPageLayout';

export const RefundPolicyPage = () => {
  return (
    <LegalPageLayout activeLegalId="legal-refund" title="Refund & Cancellation Policy">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Core Policy Principle: Zero Fees for Job Seekers</h2>
        <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-xl">
          <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-400">
            Absolute Clarification: Candidates Pay Zero Placement Fees
          </p>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
            Revival International Consultancy FZ-LLC strictly adheres to UAE MOHRE regulations, international labor standards, and ethical recruitment policies. We NEVER charge job candidates any placement fees, processing charges, or recruitment commission. Consequently, this Refund & Cancellation Policy applies EXCLUSIVELY to paid corporate employer advisory and approved academic student advisory services.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Scope of Approved Paid Services</h2>
        <p>Commercial transactions processed through our secure payment gateway relate exclusively to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Corporate Employer Executive Search & Manpower Retainers:</strong> Governed by dedicated Master Services Agreements (MSA) and formal recruitment mandates.</li>
          <li><strong>Student Academic Advisory Packages:</strong> Structured guidance for international university admissions, document attestation assistance, and standardized language testing programs (e.g. IELTS/OET coaching).</li>
          <li><strong>Document Legalization & Attestation Services:</strong> Certified consular, apostille, and Ministry of Foreign Affairs (MOFA) attestation management.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Academic Advisory Cancellation & Refund Terms</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Full Refund (100%):</strong> Written cancellation notice submitted at least 48 hours prior to the scheduled initial consultation session.</li>
          <li><strong>Partial Refund (50%):</strong> Cancellation submitted within 24 to 48 hours of scheduled session, accounting for consultant dossier preparation costs.</li>
          <li><strong>Non-Refundable:</strong> Attestation fees or consular processing payments once documents have been lodged with official sovereign ministries or embassies.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Employer Replacement Guarantees & Retainers</h2>
        <p>
          For employer recruitment mandates, commercial retainers and placement fees are protected by our standard <strong>90-Day Free Replacement Guarantee</strong>. If a deployed executive voluntarily departs or is terminated for cause within 90 days of onboarding, Revival International provides an equivalent replacement candidate at zero additional agency fee.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Refund Processing Timelines</h2>
        <p>
          Approved refunds will be processed back to the original method of payment (credit card, debit card, or corporate bank transfer) within 7 to 14 business days, in accordance with UAE banking and credit network settlement cycles.
        </p>
        <p>
          To initiate a refund enquiry, please contact: <a href="mailto:billing@therevivalinternational.com" className="text-gold-500 font-bold hover:underline">billing@therevivalinternational.com</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default RefundPolicyPage;


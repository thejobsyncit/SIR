import React from 'react';
import LegalPageLayout from './LegalPageLayout';

export const CookiePolicyPage = () => {
  return (
    <LegalPageLayout activeLegalId="legal-cookie" title="Cookie Policy">
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your computer or mobile device when you visit websites. They are widely used to ensure websites function properly, operate more efficiently, and provide analytics information to website operators.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Categories of Cookies We Use</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">A. Strictly Necessary & Essential Cookies</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Required for the fundamental operation of the candidate portal, security authentication, multi-step job application sessions, and consent preference recording. These cannot be disabled.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">B. Functional & Preference Cookies</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Enable the platform to remember your language selection (English / Arabic), dark/light theme preferences, and saved vacancy bookmarks across returning visits.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">C. Performance & Analytics Cookies</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Help us understand aggregate traffic volume, page load performance, and conversion funnels (such as Quick Apply completion rates) to improve usability. All analytics data is anonymized.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Consent & Managing Your Cookie Preferences</h2>
        <p>
          When you first visit our platform, an explicit cookie banner invites you to accept or configure cookie permissions. In accordance with the UAE Personal Data Protection Law (UAE PDPL), non-essential cookies are only deployed after your affirmative consent.
        </p>
        <p>
          You may modify your cookie preferences at any time by clearing your browser cache or clicking the cookie settings toggle in our footer.
        </p>
      </section>
    </LegalPageLayout>
  );
};

export default CookiePolicyPage;


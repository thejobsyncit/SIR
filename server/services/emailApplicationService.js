import nodemailer from 'nodemailer';

/**
 * Role-Category Map with tailored middle paragraphs and tone-appropriate skill highlights.
 * Contains specialized categories (QA, Tech, Finance, Sales, Healthcare, Engineering, Admin, Hospitality, Legal)
 * and a robust generic fallback.
 */
export const ROLE_CATEGORY_MAP = {
  qa_automation: {
    id: 'qa_automation',
    name: 'QA & Test Automation Specialist',
    skillsHint: 'Selenium, Cypress, Automated Testing, Test Frameworks, CI/CD, Regression Testing',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'Selenium, Cypress, automated test frameworks, and CI/CD quality pipelines';
      return `With deep hands-on expertise in automated quality assurance and test framework design, I specialize in implementing scalable regression suites and continuous integration checks using ${skillsString}. My focus centers on preventing software defects early in the sprint cycle, accelerating release velocity, and ensuring bulletproof end-to-end reliability across enterprise platforms.`;
    }
  },
  software_developer: {
    id: 'software_developer',
    name: 'Software Engineering & Cloud Architecture',
    skillsHint: 'Modern Frameworks, Microservices, REST/GraphQL APIs, Cloud Deployment, Clean Architecture',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'modern programming languages, full-stack frameworks, and RESTful API architecture';
      return `As a dedicated software developer with verified production experience, I bring solid proficiency in ${skillsString}. I take pride in engineering clean, maintainable code, architecting high-throughput microservices, and deploying resilient cloud applications that solve high-impact technical and business challenges.`;
    }
  },
  finance_accounting: {
    id: 'finance_accounting',
    name: 'Finance, Audit & Accounting',
    skillsHint: 'Tally, GST/VAT Compliance, Ledger Reconciliation, Statutory Reporting, Financial Modeling',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'Tally, GST/VAT statutory compliance, financial reporting, and balance sheet reconciliation';
      return `Backed by comprehensive experience in financial governance and accounting operations, my core capabilities include ${skillsString}. I maintain meticulous accuracy in general ledger reconciliation, tax filings, variance reporting, and budget forecasting to ensure fiscal integrity and regulatory compliance.`;
    }
  },
  sales_marketing: {
    id: 'sales_marketing',
    name: 'Sales, Growth & Marketing',
    skillsHint: 'Lead Generation, Target Attainment, Revenue Pipeline, Digital Campaigns, CRM Management',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'B2B/B2C lead generation, client acquisition campaigns, and quota-exceeding sales pipelines';
      return `With a proven track record of driving revenue growth and market penetration, I offer demonstrated acumen in ${skillsString}. I excel at cultivating long-term client partnerships, qualifying high-value prospect pipelines, and executing targeted outreach campaigns that consistently beat commercial performance milestones.`;
    }
  },
  healthcare_medical: {
    id: 'healthcare_medical',
    name: 'Healthcare & Clinical Practice',
    skillsHint: 'Patient Care, Clinical Diagnostics, Regulatory Protocols, Prometric/DHA Standards, Hospital Ops',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'patient-centered clinical care, diagnostic protocols, and healthcare accreditation standards';
      return `Bringing compassionate patient care and strict adherence to healthcare safety regulations, I contribute verified clinical skills in ${skillsString}. I am committed to evidence-based practice, multi-disciplinary hospital collaboration, and maintaining the highest benchmarks of medical excellence.`;
    }
  },
  construction_engineering: {
    id: 'construction_engineering',
    name: 'Civil, MEP & Infrastructure Engineering',
    skillsHint: 'FIDIC Contracts, Primavera P6 Scheduling, Structural Engineering, Site Supervision, HSE',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'FIDIC contracts, Primavera P6 scheduling, structural site supervision, and safety management';
      return `With proven leadership across large-scale commercial and infrastructure initiatives, I bring specialized technical competence in ${skillsString}. My career reflects strict budget control, milestone delivery without quality compromises, and total adherence to international building codes and health & safety mandates.`;
    }
  },
  admin_operations: {
    id: 'admin_operations',
    name: 'Administration & HR Operations',
    skillsHint: 'Workflow Optimization, Executive Administration, Documentation, Cross-Team Coordination',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'process coordination, executive administration, documentation governance, and team support';
      return `Demonstrating strong organizational precision and inter-departmental collaboration, I offer verified proficiency in ${skillsString}. I focus on streamlining day-to-day administrative workflows, managing operational documentation, and supporting organizational leadership with dependable efficiency.`;
    }
  },
  hospitality_service: {
    id: 'hospitality_service',
    name: 'Hospitality & Guest Experience',
    skillsHint: 'Guest Satisfaction, Front Office, VIP Protocol, Operational Excellence, Service Standards',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'five-star guest relations, customer service excellence, and luxury hospitality operations';
      return `Backed by seasoned front-line experience in luxury guest relations and service operations, my competencies center on ${skillsString}. I take pride in anticipating guest needs, swiftly resolving complex queries, and elevating brand reputation through impeccable hospitality standards.`;
    }
  },
  legal_compliance: {
    id: 'legal_compliance',
    name: 'Legal, Risk & Regulatory Advisory',
    skillsHint: 'Contract Drafting, Cross-Border Compliance, Risk Advisory, Regulatory Governance, Negotiations',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'contract lifecycle drafting, risk mitigation, and international regulatory governance';
      return `With a solid background in commercial law and regulatory compliance, I bring key strengths in ${skillsString}. I am skilled at identifying contractual risk, negotiating stakeholder agreements, and ensuring complete compliance with jurisdictional legal frameworks.`;
    }
  },
  generic_fallback: {
    id: 'generic_fallback',
    name: 'Professional Career Execution',
    skillsHint: 'Core Domain Execution, Analytical Thinking, Team Collaboration, Process Ownership',
    generateMiddleParagraph: ({ jobSkills, candidateExperience, candidateLocation }) => {
      const skillsString = jobSkills && jobSkills.length > 0 
        ? jobSkills.join(', ') 
        : 'professional domain proficiencies, structured problem-solving, and quality-driven execution';
      return `Throughout my career, I have cultivated a disciplined work ethic and reliable proficiency in ${skillsString}. I take complete ownership of deliverables, integrate seamlessly into multidisciplinary teams, and adapt swiftly to operational priorities to achieve outstanding organizational results.`;
    }
  }
};

/**
 * Detects the most accurate role category for a given job based on title, category, department, and skills.
 */
export const detectRoleCategory = (job = {}) => {
  const combined = [
    job.title || job.jobTitle || '',
    job.category || '',
    job.department || '',
    Array.isArray(job.skills) ? job.skills.join(' ') : (job.skills || ''),
    job.description || ''
  ].join(' ').toLowerCase();

  if (/qa|quality assurance|sdet|test|testing|automation|selenium|cypress|playwright|junit|pytest/i.test(combined)) {
    return ROLE_CATEGORY_MAP.qa_automation;
  }
  if (/developer|software|frontend|backend|full\s*stack|engineer|devops|cloud|react|node|python|java|golang|c\+\+|api|architect/i.test(combined)) {
    return ROLE_CATEGORY_MAP.software_developer;
  }
  if (/accountant|accounting|finance|financial|tally|gst|vat|audit|tax|payroll|ledger|cpa|bookkeeper|reconciliation/i.test(combined)) {
    return ROLE_CATEGORY_MAP.finance_accounting;
  }
  if (/sales|marketing|lead generation|business development|bdm|account executive|campaign|growth|seo|digital marketing/i.test(combined)) {
    return ROLE_CATEGORY_MAP.sales_marketing;
  }
  if (/nurse|doctor|physician|healthcare|medical|hospital|clinic|prometric|dha|cardiology|surgeon|patient/i.test(combined)) {
    return ROLE_CATEGORY_MAP.healthcare_medical;
  }
  if (/civil|construction|mep|structural|site engineer|project manager|primavera|fidic|drilling|offshore|architect/i.test(combined)) {
    return ROLE_CATEGORY_MAP.construction_engineering;
  }
  if (/admin|administrative|human resources|hr|recruiter|office manager|operations coordinator|receptionist/i.test(combined)) {
    return ROLE_CATEGORY_MAP.admin_operations;
  }
  if (/hotel|hospitality|guest|restaurant|chef|f&b|front office|concierge|travel/i.test(combined)) {
    return ROLE_CATEGORY_MAP.hospitality_service;
  }
  if (/legal|lawyer|counsel|attorney|contract|paralegal|compliance officer/i.test(combined)) {
    return ROLE_CATEGORY_MAP.legal_compliance;
  }

  return ROLE_CATEGORY_MAP.generic_fallback;
};

/**
 * Extracts and cleans the list of key skills from a job object.
 */
export const extractJobSkills = (job = {}) => {
  if (Array.isArray(job.skills)) {
    return job.skills.filter(Boolean).map(s => String(s).trim());
  }
  if (typeof job.skills === 'string') {
    const raw = job.skills.trim();
    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(s => String(s).trim());
      } catch (_) {}
    }
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Optional Anthropic Claude API integration.
 * Generates an 80-word grounded middle paragraph when ANTHROPIC_API_KEY is present.
 */
export const generateAiMiddleParagraph = async ({ candidate = {}, job = {} }) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const jobTitle = job.title || job.jobTitle || 'the advertised role';
    const company = job.company || job.companyName || 'your organization';
    const skills = extractJobSkills(job).join(', ') || 'required industry proficiencies';

    const prompt = `Write a concise, professional middle paragraph (max 80 words, 2-3 sentences) for a job application email.
Candidate: ${candidate.name || 'Candidate'}, Experience: ${candidate.experience || 'Experienced'}, Location: ${candidate.location || 'Regional'}.
Target Job: ${jobTitle} at ${company}.
Key Job Skills: ${skills}.
Tone: Professional, confident, truthful, no exaggerated or ungrounded claims. Highlight alignment with the role's skills. Return ONLY the paragraph text without quotes or preamble.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.content?.[0]?.text?.trim();
      if (text) return text;
    }
  } catch (err) {
    console.warn('[AI Middle Paragraph] Anthropic call failed or timed out, falling back to template map:', err.message);
  }
  return null;
};

/**
 * Primary Template Function:
 * generateApplicationEmail({ candidate, job })
 * Generates a clean, short, professional, recruiter-friendly job application email.
 * Format:
 *   Subject: Candidate Application – [Job Role] | [Company Name]
 *   Dear Hiring Team,
 *   Greetings from The Revival International!
 *   We are pleased to share a candidate application for the [Job Role] position at [Company Name]...
 *   Best regards,
 *   Recruitment Team
 *   The Revival International
 */
export const generateApplicationEmail = async ({ candidate = {}, job = {} }) => {
  // 1. Normalize Job Data from record
  const jobTitle = job.title || job.jobTitle || 'Career Opportunity';
  const companyName = job.company || job.companyName || 'Hiring Organization';
  const companyEmail = job.companyEmail || job.email || process.env.PRIMARY_EMAIL || 'enquiry@therevivalinternational.com';

  // 2. Normalize Candidate Data
  const candidateName = candidate.name || candidate.fullName || 'Candidate';
  const candidateEmail = candidate.email || 'applicant@example.com';
  const candidatePhone = candidate.phone ? candidate.phone.trim() : '';

  // 3. Exact Required Subject: Candidate Application – [Job Role] | [Company Name]
  const subject = `Candidate Application – ${jobTitle} | ${companyName}`;

  // 4. Exact Required Plain Text Body
  const textBodyLines = [
    'Dear Hiring Team,',
    '',
    'Greetings from The Revival International!',
    '',
    `We are pleased to share a candidate application for the ${jobTitle} position at ${companyName}.`,
    '',
    'Candidate Details:',
    '',
    `* Candidate Name: ${candidateName}`,
    `* Position Applied: ${jobTitle}`,
    `* Email: ${candidateEmail}`,
    `* Contact: ${candidatePhone || 'Available upon request'}`,
    '',
    'Kindly review the candidate’s profile and consider the application for the mentioned position.',
    '',
    'We look forward to your feedback.',
    '',
    'Best regards,',
    'Recruitment Team',
    'The Revival International'
  ];

  const textBody = textBodyLines.join('\n');

  // 5. Clean, Professional, Minimal HTML Version
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 24px;
      font-size: 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    p {
      margin: 0 0 16px 0;
    }
    ul {
      margin: 0 0 18px 0;
      padding-left: 20px;
      list-style-type: disc;
    }
    li {
      margin-bottom: 8px;
    }
    .signature {
      margin-top: 24px;
      line-height: 1.5;
      color: #1e293b;
    }
    .signature-title {
      font-weight: 700;
      color: #0f172a;
    }
    .signature-company {
      font-weight: 600;
      color: #d97706;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear Hiring Team,</p>
    <p>Greetings from The Revival International!</p>
    <p>We are pleased to share a candidate application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
    <p><strong>Candidate Details:</strong></p>
    <ul>
      <li><strong>Candidate Name:</strong> ${candidateName}</li>
      <li><strong>Position Applied:</strong> ${jobTitle}</li>
      <li><strong>Email:</strong> <a href="mailto:${candidateEmail}" style="color: #2563eb; text-decoration: none;">${candidateEmail}</a></li>
      <li><strong>Contact:</strong> ${candidatePhone || 'Available upon request'}</li>
    </ul>
    <p>Kindly review the candidate’s profile and consider the application for the mentioned position.</p>
    <p>We look forward to your feedback.</p>
    <div class="signature">
      <p style="margin-bottom: 4px;">Best regards,</p>
      <div class="signature-title">Recruitment Team</div>
      <div class="signature-company">The Revival International</div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    subject,
    recipientEmail: companyEmail,
    replyTo: candidateEmail,
    textBody,
    htmlBody,
    jobTitle,
    companyName
  };
};

/**
 * Creates and verifies the Nodemailer transporter.
 * Supports Zoho Mail (smtppro.zoho.in / smtp.zoho.com), Gmail, or any custom SMTP host.
 */
export const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL || 'enquiry@therevivalinternational.com';
  // Use environment variable if provided, or default to official verified Zoho Mail app credentials
  const pass = (process.env.SMTP_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || 'ReTd1xwm5nYc').replace(/\s+/g, '');
  const host = process.env.SMTP_HOST || 'smtp.zoho.in';
  const port = Number(process.env.SMTP_PORT) || 465;

  const isConfigured = Boolean(pass && !pass.includes('your-16-digit') && pass.length >= 6);

  if (!isConfigured) {
    return {
      isConfigured: false,
      user,
      sendMail: async () => ({
        simulated: true,
        messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        reason: 'SMTP_APP_PASSWORD requires a valid App Password (Zoho or Gmail)'
      })
    };
  }

  const transportOptions = {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  };

  const transporter = nodemailer.createTransport(transportOptions);

  return {
    isConfigured: true,
    user,
    sendMail: async (options) => {
      try {
        return await transporter.sendMail(options);
      } catch (err) {
        if (err.message && err.message.includes('UnblockMe')) {
          console.error('[CRITICAL ZOHO BLOCK]: Zoho Mail outgoing SMTP is locked due to unusual activity. The admin MUST unblock it at https://mail.zoho.in/UnblockMe');
        }
        // Resilient fallback: If secondary Gmail App Password is configured, try sending via Gmail
        const fallbackPass = (process.env.FALLBACK_SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
        const fallbackUser = process.env.FALLBACK_SMTP_USER || process.env.GMAIL_USER || 'thejobsyncit@gmail.com';
        if (fallbackPass && fallbackUser && fallbackUser !== user) {
          try {
            console.log('[SMTP Fallback] Attempting delivery via secondary transporter:', fallbackUser);
            const secondaryTransporter = nodemailer.createTransport({
              service: 'gmail',
              auth: { user: fallbackUser, pass: fallbackPass }
            });
            const secondaryOptions = { ...options, from: `"The Revival International" <${fallbackUser}>` };
            return await secondaryTransporter.sendMail(secondaryOptions);
          } catch (secErr) {
            console.error('[SMTP Fallback Failed]:', secErr.message);
          }
        }
        throw err;
      }
    }
  };
};

/**
 * Sends an automatic candidate introduction email from The Revival International
 * recruitment team directly to the respective employer/recruiter.
 * Sent from The Revival International official email address.
 * No attachments, no duplicate recipients, no unnecessary CCs.
 */
export const sendJobApplicationEmail = async ({
  candidate,
  job,
  emailContent,
  cvFile // { filename, buffer, mimeType, size }
}) => {
  const transporter = getTransporter();

  // Employer / hiring team email address
  const employerEmail = (job.companyEmail || job.email || process.env.PRIMARY_EMAIL || 'enquiry@therevivalinternational.com').trim();
  const fromEmail = transporter.user || 'enquiry@therevivalinternational.com';

  const mailOptions = {
    from: `"The Revival International • Recruitment Team" <${fromEmail}>`,
    to: employerEmail,
    replyTo: candidate.email || fromEmail,
    subject: emailContent.subject,
    text: emailContent.textBody,
    html: emailContent.htmlBody,
    attachments: [] // Do NOT attach resume or CV per requirements
  };

  const result = await transporter.sendMail(mailOptions);
  return {
    success: true,
    simulated: Boolean(result.simulated),
    messageId: result.messageId,
    recipient: employerEmail,
    replyTo: candidate.email || fromEmail,
    subject: emailContent.subject,
    isConfigured: transporter.isConfigured
  };
};

// Debounce cache to prevent duplicate welcome emails caused by repeated API requests
const recentWelcomeEmails = new Map();

/**
 * Sends an official Welcome & Registration Confirmation Email to newly registered candidates.
 * Redesigned with premium corporate branding, official logo, and table-based responsive layout.
 * Dispatches directly to the candidate's email (Gmail, Outlook, etc.) and notifies admin desk.
 */
export const sendCandidateWelcomeEmail = async (params = {}) => {
  const {
    name = '',
    candidateName = '',
    fullName = '',
    email = '',
    toEmail = '',
    phone = '',
    candidateId = '',
    authProvider = 'email',
    preferredCountry = '',
    country = '',
    desiredRole = ''
  } = params;

  const recipientEmail = (email || toEmail || '').trim().toLowerCase();
  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return { success: false, reason: 'Invalid or missing candidate email address' };
  }

  // Prevent duplicate confirmation emails caused by rapid repeated API requests (30s window)
  const now = Date.now();
  const lastSent = recentWelcomeEmails.get(recipientEmail);
  if (lastSent && (now - lastSent < 30000)) {
    console.log(`[Welcome Email] Debounced duplicate dispatch for ${recipientEmail} (sent ${Math.round((now - lastSent) / 1000)}s ago)`);
    return { success: true, duplicatePrevented: true };
  }
  recentWelcomeEmails.set(recipientEmail, now);

  const transporter = getTransporter();
  const fromEmail = transporter.user || 'enquiry@therevivalinternational.com';
  const adminGmail = 'thejobsyncit@gmail.com';
  const officialDesk = 'enquiry@therevivalinternational.com';

  const displayName = (name || candidateName || fullName || '').trim() || recipientEmail.split('@')[0];
  const cid = candidateId || `RI-CAND-${Math.floor(100 + Math.random() * 900)}`;

  // Official Subject specified in task requirements
  const subject = 'Welcome to The Revival International – Your Candidate Account is Confirmed!';

  // Plain Text Fallback
  const textBody = `
Dear ${displayName},

Welcome to The Revival International!

Thank you for registering with The Revival International. We are delighted to welcome you to our international talent network.

Your candidate account has been successfully created. You can now explore international career opportunities and manage your job applications through our candidate portal.

Candidate Registration Details:
--------------------------------------------------
Candidate Name:     ${displayName}
Candidate ID:       ${cid}
Registered Email:   ${recipientEmail}
Account Status:     Active & Verified
Placement Services: 100% Free of Charge
--------------------------------------------------

What You Can Do Now:
1. Explore international job opportunities in UAE, Saudi Arabia, Qatar, Singapore and Europe.
2. Apply for suitable vacancies using the Quick Apply feature.
3. Upload and manage your CV and candidate profile.
4. Track your job applications and interview progress.
5. Receive important updates about your applications.

Our Zero Placement Fee Commitment:
The Revival International is committed to ethical international recruitment. We do not charge candidates any placement or registration fees.

Explore International Opportunities:
https://www.therevivalinternational.com/#jobs

If you have any questions or require assistance, contact our support team:
Email: enquiry@therevivalinternational.com

Company Name: The Revival International
Dubai Internet City, UAE · Chennai & Bangalore, India.

© 2026 The Revival International. All rights reserved.
`.trim();

  // Premium, Responsive, Table-Based HTML Email with Official Logo
  const logoUrl = 'https://www.therevivalinternational.com/images/logo.png';
  const jobsUrl = 'https://www.therevivalinternational.com/#jobs';

  const htmlBody = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    table, td, div, p, a, h1, h2, h3 { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);">
          
          <!-- 1. Header (Dark Navy / Charcoal with Official Logo) -->
          <tr>
            <td align="center" style="background-color: #0B1B33; background: linear-gradient(135deg, #0B1B33 0%, #07101E 100%); padding: 36px 24px 30px 24px; text-align: center;">
              <!-- Official Website Logo (Absolute HTTPS URL) -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 14px auto;">
                <tr>
                  <td align="center" style="background-color: #ffffff; border-radius: 14px; padding: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.25);">
                    <img src="${logoUrl}" alt="The Revival International Logo" width="56" height="56" style="display: block; width: 56px; height: 56px; border: 0; outline: none; object-contain: contain;" />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.2;">
                The Revival <span style="display: inline-block; color: #f59e0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; padding: 3px 8px; background-color: rgba(245, 158, 11, 0.16); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; vertical-align: middle; margin-left: 4px;">International</span>
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700;">
                India &bull; GCC &bull; Worldwide
              </p>
              <div style="margin-top: 14px;">
                <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  &#10003; Candidate Registration Confirmed
                </span>
              </div>
            </td>
          </tr>

          <!-- 2. Main Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; color: #1e293b; font-size: 14px; line-height: 1.65;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
                Dear <strong>${displayName}</strong>,
              </p>
              <h2 style="margin: 0 0 16px 0; color: #0B1B33; font-family: Georgia, 'Times New Roman', serif; font-size: 21px; font-weight: 700; line-height: 1.3;">
                Welcome to The Revival International!
              </h2>
              <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px;">
                Thank you for registering with <strong>The Revival International</strong>. We are delighted to welcome you to our international talent network.
              </p>
              <p style="margin: 0 0 24px 0; color: #334155; font-size: 14px;">
                Your candidate account has been successfully created. You can now explore international career opportunities and manage your job applications through our candidate portal.
              </p>

              <!-- 3. Dynamic Candidate Registration Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 0 28px 0; overflow: hidden;">
                <tr>
                  <td style="background-color: #f1f5f9; padding: 12px 18px; border-bottom: 1px solid #e2e8f0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left" style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #475569;">
                          Candidate Registration Details
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                            Active &amp; Verified
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 40%;">Candidate Name:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 700;" align="right">${displayName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; border-top: 1px dashed #e2e8f0;">Candidate ID:</td>
                        <td style="padding: 6px 0; color: #d97706; font-size: 13px; font-weight: 800; font-family: monospace;" align="right">${cid}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; border-top: 1px dashed #e2e8f0;">Registered Email:</td>
                        <td style="padding: 6px 0; color: #0f172a; font-size: 13px; font-weight: 600; font-family: monospace;" align="right">${recipientEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; border-top: 1px dashed #e2e8f0;">Account Status:</td>
                        <td style="padding: 6px 0; color: #059669; font-size: 13px; font-weight: 700;" align="right">&#10003; Active &amp; Verified</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; border-top: 1px dashed #e2e8f0;">Placement Services:</td>
                        <td style="padding: 6px 0; color: #059669; font-size: 13px; font-weight: 700;" align="right">100% Free of Charge</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 4. What You Can Do Now -->
              <h3 style="margin: 0 0 14px 0; color: #0B1B33; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-weight: 700;">
                What You Can Do Now
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 14px 16px;">
                <tr>
                  <td style="padding: 4px 0; color: #334155; font-size: 13px; line-height: 1.6;">
                    <ol style="margin: 0; padding-left: 20px;">
                      <li style="margin-bottom: 6px;">Explore international job opportunities in UAE, Saudi Arabia, Qatar, Singapore and Europe.</li>
                      <li style="margin-bottom: 6px;">Apply for suitable vacancies using the Quick Apply feature.</li>
                      <li style="margin-bottom: 6px;">Upload and manage your CV and candidate profile.</li>
                      <li style="margin-bottom: 6px;">Track your job applications and interview progress.</li>
                      <li style="margin-bottom: 0;">Receive important updates about your applications.</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- 5. Zero Placement Fee Policy -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; margin: 0 0 28px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 13.5px; font-weight: 800; color: #92400e; margin-bottom: 6px;">
                      &ldquo;Our Zero Placement Fee Commitment&rdquo;
                    </div>
                    <div style="font-size: 13px; color: #78350f; line-height: 1.55;">
                      The Revival International is committed to ethical international recruitment. We do not charge candidates any placement or registration fees.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 6. Call-to-Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 10px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); background-color: #d97706; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);">
                          <a href="${jobsUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; color: #ffffff !important; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px;">
                            Explore International Opportunities &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 7. Support Note -->
              <p style="margin: 0; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.6;">
                If you have any questions or require assistance, contact our support team:<br />
                Email: <a href="mailto:enquiry@therevivalinternational.com" style="color: #d97706; text-decoration: none; font-weight: 700;">enquiry@therevivalinternational.com</a>
              </p>
            </td>
          </tr>

          <!-- 8. Footer -->
          <tr>
            <td align="center" style="background-color: #07101E; padding: 24px 20px; color: #94a3b8; font-size: 11px; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #e2e8f0; font-size: 12px;">
                Company Name: The Revival International
              </p>
              <p style="margin: 0 0 8px 0; color: #94a3b8;">
                Dubai Internet City, UAE &bull; Chennai &amp; Bangalore, India.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 10.5px;">
                &copy; 2026 The Revival International. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // Deliver to candidate email, and CC admin Gmail & official desk
  const toList = [recipientEmail];
  if (adminGmail && !toList.includes(adminGmail)) {
    toList.push(adminGmail);
  }
  if (officialDesk && !toList.includes(officialDesk)) {
    toList.push(officialDesk);
  }

  const mailOptions = {
    from: `"The Revival International • Admissions & Careers" <${fromEmail}>`,
    to: toList.join(', '),
    replyTo: officialDesk,
    subject,
    text: textBody,
    html: htmlBody
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return {
      success: true,
      simulated: Boolean(result.simulated),
      messageId: result.messageId,
      recipient: toList.join(', ')
    };
  } catch (err) {
    console.error('[Welcome Email Error]:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Sends an application confirmation email to the candidate and alerts admin desk.
 */
export const sendCandidateApplicationConfirmationEmail = async ({
  applicantName = '',
  applicantEmail = '',
  applicantPhone = '',
  candidateId = '',
  jobId = '',
  jobTitle = '',
  company = '',
  location = '',
  resumeName = '',
  applicationId = ''
} = {}) => {
  const transporter = getTransporter();
  const fromEmail = transporter.user || 'enquiry@therevivalinternational.com';
  const adminGmail = 'thejobsyncit@gmail.com';
  const officialDesk = 'enquiry@therevivalinternational.com';

  const recipientEmail = (applicantEmail || '').trim().toLowerCase();
  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return { success: false, reason: 'Invalid or missing candidate email address' };
  }

  const displayName = (applicantName || '').trim() || recipientEmail.split('@')[0];
  const appId = applicationId || `RI-APP-${Math.floor(10000 + Math.random() * 90000)}`;
  const title = jobTitle || 'International Vacancy';
  const comp = company || 'The Revival International Corporate Client';
  const loc = location || 'UAE / GCC';

  const subject = `Application Received: ${title} at ${comp} (App ID: ${appId})`;

  const textBody = `
Dear ${displayName},

Thank you for applying through The Revival International portal!

Your application details:
--------------------------------------------------
Application ID:    ${appId}
Position:          ${title}
Company / Mandate: ${comp}
Location:          ${loc}
Applicant Name:    ${displayName}
Applicant Email:   ${recipientEmail}
${applicantPhone ? `Phone / WhatsApp:  ${applicantPhone}\n` : ''}${resumeName ? `Attached CV:       ${resumeName}\n` : ''}Status:            Under Review & Verification
--------------------------------------------------

What happens next?
1. Our recruitment and talent acquisition team is reviewing your profile and credentials.
2. Shortlisted candidates are contacted directly via email and WhatsApp to schedule technical and HR interviews.
3. You can track your real-time status under your Candidate Dashboard on the portal.

Zero Fee Policy:
The Revival International adheres strictly to global ethical recruitment standards. We never charge jobseekers or candidates any placement, registration, or visa processing fees.

Need Support?
Official Desk: enquiry@therevivalinternational.com
Helpline:      +91 90034 75405
Website:       https://www.therevivalinternational.com

Sincerely,
The Revival International Recruitment & Talent Acquisition Team
Dubai Internet City, UAE & Chennai, India
`.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
    .brand-subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #d97706; font-weight: bold; margin-top: 4px; }
    .badge { display: inline-block; background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 11px; font-weight: bold; padding: 5px 12px; border-radius: 9999px; margin-top: 12px; text-transform: uppercase; }
    h2 { margin: 0 0 14px 0; color: #0f172a; font-size: 19px; }
    p { margin: 0 0 14px 0; font-size: 13.5px; color: #334155; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 12.5px; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; }
    .value { color: #0f172a; font-weight: 700; text-align: right; }
    .cta-container { text-align: center; margin: 24px 0 18px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 13.5px; padding: 12px 28px; border-radius: 10px; }
    .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">The Revival International</div>
      <div class="brand-subtitle">Tier-1 International Manpower & Recruitment Firm • UAE • GCC • Worldwide</div>
      <div class="badge">✓ Job Application Submitted</div>
    </div>
    <h2>Application Received, ${displayName}!</h2>
    <p>We have successfully received your application for <strong>${title}</strong> at <strong>${comp}</strong>.</p>
    <div class="card">
      <div class="row"><span class="label">Application Reference:</span><span class="value">${appId}</span></div>
      <div class="row"><span class="label">Job Role:</span><span class="value">${title}</span></div>
      <div class="row"><span class="label">Company / Client:</span><span class="value">${comp}</span></div>
      <div class="row"><span class="label">Location:</span><span class="value">${loc}</span></div>
      ${applicantPhone ? `<div class="row"><span class="label">Phone:</span><span class="value">${applicantPhone}</span></div>` : ''}
      ${resumeName ? `<div class="row"><span class="label">Submitted CV:</span><span class="value">${resumeName}</span></div>` : ''}
      <div class="row"><span class="label">Current Status:</span><span class="value" style="color: #059669;">Under Review</span></div>
    </div>
    <div class="cta-container">
      <a href="https://www.therevivalinternational.com/#candidate-dashboard" class="cta-btn">View Candidate Portal &rarr;</a>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} The Revival International. Dubai, UAE &bull; Chennai & Bangalore, India.
    </div>
  </div>
</body>
</html>
`.trim();

  const toList = [recipientEmail];
  if (adminGmail && !toList.includes(adminGmail)) toList.push(adminGmail);
  if (officialDesk && !toList.includes(officialDesk)) toList.push(officialDesk);

  try {
    const result = await transporter.sendMail({
      from: `"The Revival International • Careers" <${fromEmail}>`,
      to: toList.join(', '),
      replyTo: officialDesk,
      subject,
      text: textBody,
      html: htmlBody
    });
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('[Application Email Error]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a service enquiry acknowledgement email to the client and alerts admin desk.
 */
export const sendServiceEnquiryConfirmationEmail = async ({
  name = '',
  email = '',
  phone = '',
  company = '',
  serviceTitle = '',
  serviceId = '',
  message = '',
  referenceNumber = '',
  countryInterest = '',
  consultationDate = '',
  consultationTime = '',
  consultationMode = ''
} = {}) => {
  const transporter = getTransporter();
  const fromEmail = transporter.user || 'enquiry@therevivalinternational.com';
  const adminGmail = 'thejobsyncit@gmail.com';
  const officialDesk = 'enquiry@therevivalinternational.com';

  const recipientEmail = (email || '').trim().toLowerCase();
  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return { success: false, reason: 'Invalid or missing client email address' };
  }

  const displayName = (name || '').trim() || recipientEmail.split('@')[0];
  const refCode = referenceNumber || `REV-${Date.now().toString(36).toUpperCase()}`;
  const sTitle = serviceTitle || 'International Consulting & Recruitment Service';

  const subject = `Enquiry Acknowledged: ${sTitle} (Ref: ${refCode}) – The Revival International`;

  const textBody = `
Dear ${displayName},

Thank you for reaching out to The Revival International!

We have successfully received your service enquiry:
--------------------------------------------------
Reference Number:  ${refCode}
Requested Service: ${sTitle}
Client Name:       ${displayName}
${company ? `Organization:       ${company}\n` : ''}Email:             ${recipientEmail}
${phone ? `Contact Number:    ${phone}\n` : ''}${countryInterest ? `Country/Region:    ${countryInterest}\n` : ''}${consultationDate ? `Appointment Date:  ${consultationDate} at ${consultationTime || 'Scheduled'} (${consultationMode || 'Virtual'})\n` : ''}${message ? `Enquiry Brief:     ${message}\n` : ''}Status:            Assigned to Senior Advisor (Dhanalakshimi)
--------------------------------------------------

Our executive advisory team will review your requirements and get in touch with you within 24 business hours.

Official Enquiry Desk: enquiry@therevivalinternational.com
Helpline / WhatsApp:   +91 90034 75405
Website:               https://www.therevivalinternational.com

Sincerely,
The Revival International Advisory Services
Dubai Internet City, UAE & Chennai, India
`.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Service Enquiry Acknowledged</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
    .brand-subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #d97706; font-weight: bold; margin-top: 4px; }
    .badge { display: inline-block; background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-size: 11px; font-weight: bold; padding: 5px 12px; border-radius: 9999px; margin-top: 12px; text-transform: uppercase; }
    h2 { margin: 0 0 14px 0; color: #0f172a; font-size: 19px; }
    p { margin: 0 0 14px 0; font-size: 13.5px; color: #334155; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 12.5px; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 600; }
    .value { color: #0f172a; font-weight: 700; text-align: right; }
    .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">The Revival International</div>
      <div class="brand-subtitle">Executive Search • Global Manpower • Corporate Advisory</div>
      <div class="badge">✓ Consultation Enquiry Received</div>
    </div>
    <h2>Thank you for your enquiry, ${displayName}!</h2>
    <p>We have successfully received your enquiry for <strong>${sTitle}</strong>. Our senior advisory desk is reviewing your requirements.</p>
    <div class="card">
      <div class="row"><span class="label">Reference ID:</span><span class="value">${refCode}</span></div>
      <div class="row"><span class="label">Service Requested:</span><span class="value">${sTitle}</span></div>
      ${company ? `<div class="row"><span class="label">Organization:</span><span class="value">${company}</span></div>` : ''}
      ${phone ? `<div class="row"><span class="label">Phone:</span><span class="value">${phone}</span></div>` : ''}
      ${countryInterest ? `<div class="row"><span class="label">Country of Interest:</span><span class="value">${countryInterest}</span></div>` : ''}
      ${consultationDate ? `<div class="row"><span class="label">Appointment:</span><span class="value">${consultationDate} ${consultationTime || ''} (${consultationMode || 'Virtual'})</span></div>` : ''}
      <div class="row"><span class="label">Assigned Advisor:</span><span class="value" style="color: #d97706;">Dhanalakshimi (Lead Advisor)</span></div>
    </div>
    <p style="font-size: 13px; color: #64748b;">Our lead consultant will contact you via your preferred communication channel within 24 business hours.</p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} The Revival International. Dubai, UAE &bull; Chennai & Bangalore, India.
    </div>
  </div>
</body>
</html>
`.trim();

  const toList = [recipientEmail];
  if (adminGmail && !toList.includes(adminGmail)) toList.push(adminGmail);
  if (officialDesk && !toList.includes(officialDesk)) toList.push(officialDesk);

  try {
    const result = await transporter.sendMail({
      from: `"The Revival International • Advisory Desk" <${fromEmail}>`,
      to: toList.join(', '),
      replyTo: officialDesk,
      subject,
      text: textBody,
      html: htmlBody
    });
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('[Enquiry Email Error]:', err.message);
    return { success: false, error: err.message };
  }
};

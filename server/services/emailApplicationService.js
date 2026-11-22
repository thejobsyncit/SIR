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

/**
 * Sends an official Welcome & Registration Confirmation Email to newly registered candidates.
 * Dispatches directly to the candidate's email (Gmail, etc.) and notifies admin desk.
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

  const transporter = getTransporter();
  const fromEmail = transporter.user || 'enquiry@therevivalinternational.com';
  const adminGmail = 'thejobsyncit@gmail.com';
  const officialDesk = 'enquiry@therevivalinternational.com';

  const recipientEmail = (email || toEmail || '').trim().toLowerCase();
  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return { success: false, reason: 'Invalid or missing candidate email address' };
  }

  const displayName = (name || candidateName || fullName || '').trim() || recipientEmail.split('@')[0];
  const cid = candidateId || `RI-CAND-${Math.floor(100 + Math.random() * 900)}`;
  const methodLabel = authProvider === 'google' ? 'Google OAuth 2.0 (Verified)' : 'Direct Candidate Registration';
  const targetCountry = preferredCountry || country || 'UAE';

  const subject = `Welcome to The Revival International – Candidate Registration Confirmed (${cid})`;

  const textBody = `
Dear ${displayName},

Welcome to The Revival International!

Your candidate account has been successfully created and registered on our international recruitment portal.

Account Summary:
--------------------------------------------------
Candidate Name:   ${displayName}
Candidate ID:     ${cid}
Registered Email: ${recipientEmail}
${phone ? `Phone / WhatsApp: ${phone}\n` : ''}${preferredCountry ? `Target Region:    ${preferredCountry}\n` : ''}Registration:     ${methodLabel}
Account Status:   Active & Verified
Placement Fee:    100% Free Placement (Zero Candidate Charges)
--------------------------------------------------

Next Steps to Land Your Next Role:
1. Browse verified international vacancies across UAE, Saudi Arabia, Qatar, Singapore, and Europe.
2. Use Instant Quick Apply to submit your tailored CV directly to hiring employers.
3. Track your application pipeline and interview stages in real time from your Candidate Dashboard.

Zero Fee Policy:
The Revival International adheres strictly to global ethical recruitment standards. We never charge jobseekers or candidates any placement, registration, or visa processing fees.

Need Support?
Official Enquiry Desk: enquiry@therevivalinternational.com
Helpline / WhatsApp:   +91 90034 75405
Website:               https://www.therevivalinternational.com

Sincerely,
The Revival International Candidate Services Team
Dubai Internet City, UAE & Chennai, India
`.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Revival International</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
    .brand-title { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin: 0; }
    .brand-subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #d97706; font-weight: bold; margin-top: 4px; }
    .badge { display: inline-block; background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 11px; font-weight: bold; padding: 5px 12px; border-radius: 9999px; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    h2 { margin: 0 0 14px 0; color: #0f172a; font-size: 19px; }
    p { margin: 0 0 14px 0; font-size: 13.5px; color: #334155; }
    .account-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0; }
    .account-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 12.5px; }
    .account-row:last-child { border-bottom: none; }
    .account-label { color: #64748b; font-weight: 600; }
    .account-value { color: #0f172a; font-weight: 700; text-align: right; }
    .benefits-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 18px 0; font-size: 12.5px; color: #92400e; }
    .cta-container { text-align: center; margin: 24px 0 18px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 13.5px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25); }
    .steps-box { background: #f1f5f9; border-radius: 10px; padding: 14px 16px; margin: 18px 0; font-size: 12.5px; }
    .steps-box ol { margin: 6px 0 0 16px; padding: 0; }
    .steps-box li { margin-bottom: 4px; color: #334155; }
    .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">The Revival International</div>
      <div class="brand-subtitle">Tier-1 International Manpower & Recruitment Firm • UAE • GCC • Worldwide</div>
      <div class="badge">✓ Candidate Account Confirmed</div>
    </div>

    <h2>Welcome to Revival International, ${displayName}!</h2>
    <p>
      Thank you for registering with <strong>The Revival International</strong>. Your official candidate profile has been successfully created and linked to our verified talent network.
    </p>

    <div class="account-card">
      <div class="account-row">
        <span class="account-label">Candidate Name:</span>
        <span class="account-value">${displayName}</span>
      </div>
      <div class="account-row">
        <span class="account-label">Candidate ID:</span>
        <span class="account-value" style="color: #d97706; font-family: monospace;">${cid}</span>
      </div>
      <div class="account-row">
        <span class="account-label">Registered Email:</span>
        <span class="account-value">${recipientEmail}</span>
      </div>
      ${phone ? `
      <div class="account-row">
        <span class="account-label">Phone / WhatsApp:</span>
        <span class="account-value">${phone}</span>
      </div>` : ''}
      ${preferredCountry ? `
      <div class="account-row">
        <span class="account-label">Target Region:</span>
        <span class="account-value">${preferredCountry}</span>
      </div>` : ''}
      <div class="account-row">
        <span class="account-label">Account Status:</span>
        <span class="account-value" style="color: #059669;">Active & Verified</span>
      </div>
      <div class="account-row">
        <span class="account-label">Placement Services:</span>
        <span class="account-value" style="color: #059669;">100% Free of Charge</span>
      </div>
    </div>

    <div class="steps-box">
      <strong style="color: #0f172a;">What you can do now:</strong>
      <ol>
        <li>Browse hundreds of verified vacancies in UAE, Saudi Arabia, Qatar, Singapore, and Europe.</li>
        <li>Use <strong>Instant Quick Apply</strong> to submit role-tailored application emails with your CV attached.</li>
        <li>Track your application milestones and interview progress from your dashboard.</li>
      </ol>
    </div>

    <div class="benefits-box">
      <strong>Zero Fee Policy:</strong> The Revival International strictly adheres to ethical international recruitment standards. We never charge jobseekers or candidates any placement, registration, or visa processing fees.
    </div>

    <div class="cta-container">
      <a href="${process.env.FRONTEND_URL || 'https://www.therevivalinternational.com'}/#jobs" class="cta-btn" style="color: #ffffff !important;">Browse International Vacancies &rarr;</a>
    </div>

    <p style="font-size: 12.5px; color: #64748b; margin-top: 18px;">
      If you have any questions or require support, reply directly to this email or reach us at <a href="mailto:enquiry@therevivalinternational.com" style="color: #d97706; text-decoration: none; font-weight: 600;">enquiry@therevivalinternational.com</a>.
    </p>

    <div class="footer">
      &copy; ${new Date().getFullYear()} The Revival International. All rights reserved.<br>
      Licensed Overseas Employment & Executive Search Firm.<br>
      Dubai Internet City, UAE &bull; Chennai & Bangalore, India.
    </div>
  </div>
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

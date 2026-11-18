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
 * generateApplicationEmail({ candidate, job, middleParagraphOverride })
 * Generates subject, plain text body, HTML body, and metadata strictly from job and candidate records.
 */
export const generateApplicationEmail = async ({ candidate = {}, job = {}, middleParagraphOverride = null }) => {
  // 1. Normalize Job Data from record
  const jobTitle = job.title || job.jobTitle || 'Valued Position';
  const companyName = job.company || job.companyName || 'Enterprise Employer';
  const companyEmail = job.companyEmail || job.email || process.env.PRIMARY_EMAIL || 'enquiry@therevivalinternational.com';
  const location = job.location || job.country || 'Target Location';
  const department = job.department || job.category || 'Operations';
  const jobSkills = extractJobSkills(job);

  // 2. Normalize Candidate Data
  const candidateName = candidate.name || candidate.fullName || 'Candidate';
  const candidateEmail = candidate.email || 'applicant@example.com';
  const candidatePhone = candidate.phone || '—';
  const candidateLocation = candidate.location || 'Dubai, UAE';
  const candidateExperience = candidate.experience || 'Extensive professional experience';
  const candidateNotice = candidate.noticePeriod || 'Standard notice period';

  // 3. Detect Role Category
  const categoryConfig = detectRoleCategory(job);

  // 4. Generate Middle Paragraph (AI -> Template -> Fallback)
  let middleParagraph = middleParagraphOverride;
  let generationSource = 'Custom Override';

  if (!middleParagraph) {
    const aiParagraph = await generateAiMiddleParagraph({ candidate, job });
    if (aiParagraph) {
      middleParagraph = aiParagraph;
      generationSource = 'Claude Sonnet 4.6 (AI Tailored)';
    } else {
      middleParagraph = categoryConfig.generateMiddleParagraph({
        jobSkills,
        candidateExperience,
        candidateLocation
      });
      generationSource = `Template Map: ${categoryConfig.name}`;
    }
  }

  // 5. Structure Elements
  const subject = `Application for ${jobTitle} – ${location}`;
  const salutation = `Dear Hiring Team at ${companyName},`;
  const opening = `I am writing to express my strong interest in the ${jobTitle} opportunity with ${companyName} in ${location}. Having reviewed your requirements for the ${department} department, I believe my background and technical capabilities make me a strong candidate for this role.`;
  const closing = `My attached CV provides a comprehensive overview of my credentials, projects, and career progression. I am currently based in ${candidateLocation}, bring ${candidateExperience} of relevant domain experience, and am available to join within ${candidateNotice}. I welcome the opportunity to discuss how my skillset can contribute to ${companyName}'s continued success.`;
  const signOff = `Thank you for your time and consideration.\n\nSincerely,\n${candidateName}\nPhone / WhatsApp: ${candidatePhone}\nEmail: ${candidateEmail}\nLocation: ${candidateLocation}`;

  // 6. Plain Text Version
  const textBody = `${salutation}\n\n${opening}\n\n${middleParagraph}\n\n${closing}\n\n${signOff}`;

  // 7. HTML Version (Responsive, professional corporate formatting)
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header-badge { display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; margin-bottom: 12px; }
    h2 { margin: 0 0 16px 0; color: #0f172a; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }
    p { margin: 0 0 16px 0; font-size: 14px; color: #334155; }
    .highlight-box { background: #f8fafc; border-left: 4px solid #d97706; padding: 14px 16px; border-radius: 4px 8px 8px 4px; margin: 16px 0; font-size: 14px; color: #1e293b; font-weight: 500; }
    .meta-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; background: #f8fafc; border-radius: 8px; overflow: hidden; }
    .meta-table td { padding: 8px 12px; border: 1px solid #e2e8f0; }
    .meta-label { font-weight: bold; color: #64748b; width: 35%; }
    .signature { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .signature-name { font-size: 16px; font-weight: bold; color: #0f172a; }
    .signature-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
    .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <span class="header-badge">Direct Candidate Job Application</span>
    <h2>${subject}</h2>
    
    <p><strong>${salutation}</strong></p>
    <p>${opening}</p>
    
    <div class="highlight-box">
      ${middleParagraph}
    </div>
    
    <p>${closing}</p>

    <table class="meta-table">
      <tr><td class="meta-label">Candidate Name:</td><td><strong>${candidateName}</strong></td></tr>
      <tr><td class="meta-label">Target Role:</td><td>${jobTitle} (${department})</td></tr>
      <tr><td class="meta-label">Current Location:</td><td>${candidateLocation}</td></tr>
      <tr><td class="meta-label">Total Experience:</td><td>${candidateExperience}</td></tr>
      <tr><td class="meta-label">Notice Period:</td><td>${candidateNotice}</td></tr>
      <tr><td class="meta-label">Candidate Contact:</td><td>${candidatePhone} • <a href="mailto:${candidateEmail}" style="color: #d97706; text-decoration: none;">${candidateEmail}</a></td></tr>
    </table>

    <div class="signature">
      <div class="signature-name">${candidateName}</div>
      <div class="signature-meta">
        Phone: ${candidatePhone} &bull; Email: <a href="mailto:${candidateEmail}" style="color: #d97706; text-decoration: none;">${candidateEmail}</a><br>
        Location: ${candidateLocation} &bull; Attached: Official Curriculum Vitae (CV)
      </div>
    </div>

    <div class="footer">
      Sent securely via The Revival Recruitment Portal. Candidate verified & attested.
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
    opening,
    middleParagraph,
    closing,
    salutation,
    signOff,
    category: categoryConfig.id,
    categoryName: categoryConfig.name,
    generationSource,
    jobTitle,
    companyName,
    location,
    department,
    jobSkills
  };
};

/**
 * Creates and verifies the Nodemailer transporter.
 */
export const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL || 'thejobsyncit@gmail.com';
  const pass = (process.env.SMTP_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  const isConfigured = Boolean(pass && !pass.includes('your-16-digit') && pass.length >= 8);

  if (!isConfigured) {
    return {
      isConfigured: false,
      user,
      sendMail: async () => ({
        simulated: true,
        messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        reason: 'SMTP_APP_PASSWORD requires a valid Google 16-character App Password'
      })
    };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  return {
    isConfigured: true,
    user,
    sendMail: (options) => transporter.sendMail(options)
  };
};

/**
 * Sends the job application email with the candidate's CV attached.
 * Dispatches to the company email, admin inbox, and CCs the candidate.
 */
export const sendJobApplicationEmail = async ({
  candidate,
  job,
  emailContent,
  cvFile // { filename, buffer, mimeType, size }
}) => {
  const transporter = getTransporter();

  const primaryRecipient = emailContent.recipientEmail || job.companyEmail || 'enquiry@therevivalinternational.com';
  const adminEmail = process.env.SMTP_USER || process.env.SMTP_EMAIL || 'thejobsyncit@gmail.com';
  const candidateEmail = candidate.email;
  const fromEmail = transporter.user;

  // Build unique recipient list
  const toList = [primaryRecipient];
  if (adminEmail && !toList.includes(adminEmail)) {
    toList.push(adminEmail);
  }

  const mailOptions = {
    from: `"The Revival International • Careers" <${fromEmail}>`,
    to: toList.join(', '),
    cc: candidateEmail, // Candidate receives an acknowledgement copy in their inbox!
    replyTo: candidateEmail,
    subject: emailContent.subject,
    text: emailContent.textBody,
    html: emailContent.htmlBody,
    attachments: cvFile?.buffer ? [
      {
        filename: cvFile.filename || 'Curriculum_Vitae.pdf',
        content: cvFile.buffer,
        contentType: cvFile.mimeType || 'application/pdf'
      }
    ] : []
  };

  const result = await transporter.sendMail(mailOptions);
  return {
    success: true,
    simulated: Boolean(result.simulated),
    messageId: result.messageId,
    recipient: toList.join(', '),
    candidateCc: candidateEmail,
    replyTo: candidateEmail,
    subject: emailContent.subject,
    isConfigured: transporter.isConfigured
  };
};

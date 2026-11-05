const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'server', 'index.js');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Add import
if (!content.includes('aiAdvisorEngine.js')) {
  content = content.replace(
    /import dotenv from 'dotenv';/g,
    "import dotenv from 'dotenv';\nimport { handleAIAdvisorQuery, REVIVAL_KNOWLEDGE_BASE } from './services/aiAdvisorEngine.js';"
  );
}

// 2. Replace /api/ai/chat endpoint and add /api/ai/lead
const oldChatPattern = /app\.post\('\/api\/ai\/chat', \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, reply \}\);\s*\}\);/;

const newEndpoints = `// AI Advisor Chat Engine (Production Multi-Provider & Contextual RAG)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], context = {} } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: 'Please provide a valid question or message.',
        suggestedQuestions: ['International Admissions', 'Dubai Jobs', 'GCC Work Visas', 'IELTS Preparation']
      });
    }

    const sanitizedMessage = message.trim().slice(0, 2000);
    const sanitizedHistory = Array.isArray(conversationHistory) 
      ? conversationHistory.slice(-10).map(m => ({
          sender: m.sender === 'user' ? 'user' : 'bot',
          text: String(m.text || '').slice(0, 1500),
          detectedService: m.detectedService || null
        }))
      : [];

    const result = await handleAIAdvisorQuery({
      message: sanitizedMessage,
      conversationHistory: sanitizedHistory,
      context
    });

    res.json(result);
  } catch (err) {
    console.error('Revival AI Advisor Chat Error:', err);
    res.status(500).json({
      success: false,
      reply: 'Our Revival AI Advisor is momentarily synchronizing with our global knowledge base. You can also connect directly with our admissions and recruitment consultants on WhatsApp at +91 9003475405.',
      suggestedQuestions: [
        'Connect on WhatsApp (+91 9003475405)',
        'What services does Revival International offer?',
        'Book an Advisory Consultation'
      ],
      offerConsultation: true
    });
  }
});

// AI Advisor Lead & Consultation Capture
app.post('/api/ai/lead', async (req, res) => {
  try {
    const {
      name, email, phone,
      serviceId, serviceTitle,
      countryInterest, preferredContactMethod,
      requirements, conversationSummary
    } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone or WhatsApp number with country code.' });
    }

    const db = await getDb();
    const leadId = 'LEAD-AI-' + Date.now().toString().slice(-6);
    const refCode = 'REV-AI-' + Math.floor(1000 + Math.random() * 9000);

    const sId = serviceId ? String(serviceId).trim() : 'intl-consult';
    const sTitle = serviceTitle ? String(serviceTitle).trim() : 'International Consulting & Advisory';
    const destination = countryInterest ? String(countryInterest).trim() : 'Global / Undecided';
    const contactMethod = preferredContactMethod ? String(preferredContactMethod).trim() : 'WhatsApp';

    const fullMessage = [
      \`[Source: Revival AI Advisor Consultation Booking]\`,
      \`Target Destination: \${destination}\`,
      \`Preferred Contact Method: \${contactMethod}\`,
      requirements ? \`Requirements: \${requirements.trim()}\` : '',
      conversationSummary ? \`\\n--- AI Conversation Summary ---\\n\${conversationSummary.trim()}\` : ''
    ].filter(Boolean).join('\\n');

    await db.run(
      \`INSERT INTO leads (
        id, name, email, company, phone, message, serviceId, serviceTitle,
        referenceNumber, countryInterest, assistanceType, intakeTerm, degreeLevel,
        preferredContactMethod, priority, status, utmSource, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))\`,
      [
        leadId,
        name.trim(),
        email.trim(),
        'Individual Applicant',
        phone.trim(),
        fullMessage,
        sId,
        sTitle,
        refCode,
        destination,
        'AI Advisor Consultation',
        'Fall 2026',
        'Undergraduate/Postgraduate',
        contactMethod,
        'High',
        'New Enquiry',
        'Revival AI Advisor'
      ]
    );

    await logAuditTrail(
      db,
      leadId,
      'Revival AI Advisor',
      'CREATE_LEAD',
      \`New consultation inquiry logged via AI Advisor for \${name.trim()} (\${sTitle})\`,
      null,
      { leadId, refCode, email: email.trim(), serviceTitle: sTitle }
    );

    res.json({
      success: true,
      leadId,
      referenceNumber: refCode,
      message: 'Your consultation inquiry has been securely registered with The Revival International.',
      whatsappLink: \`https://wa.me/919003475405?text=\${encodeURIComponent(\`Hello The Revival International, I booked an advisory consultation via Revival AI Advisor. My reference is \${refCode} (\${name.trim()}).\`)}\`
    });
  } catch (err) {
    console.error('Error logging AI Advisor lead:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to record consultation. Please connect directly on WhatsApp at +91 9003475405.'
    });
  }
});`;

if (oldChatPattern.test(content)) {
  content = content.replace(oldChatPattern, newEndpoints);
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Successfully updated server/index.js with intelligent AI Advisor endpoints.');
} else {
  console.error('Could not find oldChatPattern in server/index.js');
}


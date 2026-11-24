import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Robust Email Gateway for The Revival International
 * - Singleton SMTP connection pooling (prevents rapid connection churn)
 * - Rate limiting (max 1 email per 2 seconds, safeguards Zoho anti-abuse thresholds)
 * - Automatic prevention of self-looping MX bounces (stripping sender from to/bcc)
 * - Compliant RFC 2822 headers with unique Message-IDs
 * - Automatic secondary fallback (Gmail / secondary SMTP)
 */

let _primaryTransporter = null;
let _secondaryTransporter = null;
let _lastDispatchTime = 0;
const MIN_DISPATCH_INTERVAL_MS = 1500; // Minimum 1.5s between consecutive outgoing emails

/**
 * Returns or initializes the pooled primary Zoho SMTP transporter
 */
export const getPrimaryTransporter = () => {
  if (_primaryTransporter) return _primaryTransporter;

  const host = process.env.SMTP_HOST || 'smtp.zoho.in';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || process.env.SMTP_EMAIL || 'enquiry@therevivalinternational.com').trim();
  const pass = (process.env.SMTP_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || 'ReTd1xwm5nYc').replace(/\s+/g, '');

  if (!pass) return null;

  _primaryTransporter = nodemailer.createTransport({
    pool: true,
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    maxConnections: 1, // Zoho strictly prefers 1 concurrent connection
    maxMessages: 100, // Re-use connection for up to 100 messages before refreshing
    rateDelta: 2000,
    rateLimit: 1, // Max 1 message per 2 seconds built-in
    tls: { rejectUnauthorized: false }
  });

  return _primaryTransporter;
};

/**
 * Returns or initializes the secondary fallback transporter (e.g. Gmail)
 */
export const getSecondaryTransporter = () => {
  if (_secondaryTransporter) return _secondaryTransporter;

  const fallbackUser = (process.env.FALLBACK_SMTP_USER || process.env.GMAIL_USER || 'thejobsyncit@gmail.com').trim();
  const fallbackPass = (process.env.FALLBACK_SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (!fallbackPass || !fallbackUser) return null;

  _secondaryTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: fallbackUser, pass: fallbackPass }
  });

  return _secondaryTransporter;
};

/**
 * Sanitizes recipients list to prevent duplicate addresses and internal self-loops
 */
export const sanitizeRecipients = (recipients, senderEmail) => {
  if (!recipients) return [];
  const list = Array.isArray(recipients) ? recipients : String(recipients).split(',');
  const senderClean = (senderEmail || '').toLowerCase().trim();
  const seen = new Set();
  const result = [];

  list.forEach(r => {
    const clean = String(r || '').toLowerCase().trim();
    if (clean && clean.includes('@') && !seen.has(clean)) {
      seen.add(clean);
      // Omit self-addressing when sender equals recipient (prevents Zoho anti-spam loop traps)
      if (clean !== senderClean) {
        result.push(clean);
      }
    }
  });

  return result;
};

/**
 * Safe throttled sequential dispatcher ensuring spacing between consecutive sends
 */
const throttleDispatch = async () => {
  const now = Date.now();
  const diff = now - _lastDispatchTime;
  if (diff < MIN_DISPATCH_INTERVAL_MS) {
    const delay = MIN_DISPATCH_INTERVAL_MS - diff;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  _lastDispatchTime = Date.now();
};

/**
 * Dispatches an email with strict anti-blocking safeguards, compliant headers,
 * and automatic fallback.
 */
export const safeSendMail = async (options = {}) => {
  const defaultSender = (process.env.SMTP_USER || process.env.SMTP_EMAIL || 'enquiry@therevivalinternational.com').trim();
  const senderEmail = defaultSender;

  // 1. Sanitize 'to' recipients (never include the sender's own address in 'to')
  const toList = sanitizeRecipients(options.to, senderEmail);
  if (toList.length === 0) {
    // If 'to' was only the sender itself (e.g. an admin alert), send to admin gmail instead
    toList.push('thejobsyncit@gmail.com');
  }

  // 2. Sanitize 'bcc' recipients
  let bccList = [];
  if (options.bcc) {
    bccList = sanitizeRecipients(options.bcc, senderEmail);
    // Remove anyone already in 'to'
    bccList = bccList.filter(b => !toList.includes(b));
  }

  // 3. Generate unique RFC 2822 compliant Message-ID
  const domain = 'therevivalinternational.com';
  const uniqueToken = `${Date.now()}.${Math.random().toString(36).substring(2, 10)}`;
  const messageId = `<${uniqueToken}@${domain}>`;

  const finalMailOptions = {
    ...options,
    from: options.from || `"The Revival International" <${senderEmail}>`,
    to: toList.join(', '),
    bcc: bccList.length > 0 ? bccList.join(', ') : undefined,
    replyTo: options.replyTo || senderEmail,
    headers: {
      'Message-ID': messageId,
      'Date': new Date().toUTCString(),
      'X-Mailer': 'The Revival International Mail Gateway',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      ...(options.headers || {})
    }
  };

  // 4. Rate-limited execution
  await throttleDispatch();

  // 5. Try Primary Transporter (Pooled Zoho)
  const primary = getPrimaryTransporter();
  if (primary) {
    try {
      const result = await primary.sendMail(finalMailOptions);
      return {
        success: true,
        messageId: result.messageId || messageId,
        provider: 'zoho'
      };
    } catch (primaryErr) {
      console.warn('[Mail Gateway] Primary dispatch notice:', primaryErr.message);

      if (primaryErr.message && primaryErr.message.includes('UnblockMe')) {
        console.error('[CRITICAL ZOHO BLOCK]: Zoho outgoing SMTP is locked due to unusual sending activity. The admin MUST unblock at https://mail.zoho.in/UnblockMe');
      }

      // Try Secondary Transporter (Gmail) if available
      const secondary = getSecondaryTransporter();
      if (secondary) {
        try {
          const fallbackSender = (process.env.FALLBACK_SMTP_USER || process.env.GMAIL_USER || 'thejobsyncit@gmail.com').trim();
          console.log('[Mail Gateway] Attempting delivery via secondary transporter:', fallbackSender);
          const fallbackOptions = {
            ...finalMailOptions,
            from: `"The Revival International" <${fallbackSender}>`
          };
          const secResult = await secondary.sendMail(fallbackOptions);
          return {
            success: true,
            messageId: secResult.messageId || messageId,
            provider: 'gmail-fallback'
          };
        } catch (secErr) {
          console.error('[Mail Gateway] Secondary fallback failed:', secErr.message);
        }
      }

      throw primaryErr;
    }
  }

  // If no SMTP configured, simulate in development
  console.log('[Mail Gateway] SMTP not configured. Simulating dispatch to:', toList.join(', '));
  return {
    success: true,
    simulated: true,
    messageId: `sim-${Date.now()}`
  };
};

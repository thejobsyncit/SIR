/**
 * Revival International — Enterprise Analytics & Conversion Tracking Engine
 * Compliant with Google Analytics 4 (GA4), Google Tag Manager (GTM), and GDPR Cookie Consent.
 * Strictly enforces PII protection (zero names, emails, phone numbers or personal messages in payloads).
 */

const GA_MEASUREMENT_ID = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GA_MEASUREMENT_ID) || null;
const GTM_ID = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GTM_ID) || null;

// Dedicated deduplication set to prevent duplicate conversion firings within the session
const trackedConversionReferences = new Set();
const trackedEnquiryStarts = new Set();

// In-memory debug buffer for developer inspection and automated test validation
const recentAnalyticsEvents = [];
const MAX_BUFFER_SIZE = 50;

/**
 * Checks whether user has explicitly granted analytics cookie consent
 */
export const hasCookieConsent = () => {
  if (typeof window === 'undefined') return false;
  try {
    const consent = localStorage.getItem('sir_cookie_consent');
    return consent === 'all' || consent === 'true';
  } catch {
    return false;
  }
};

/**
 * Strips Personally Identifiable Information (PII) from event parameters
 */
export const sanitizeParams = (params = {}) => {
  if (!params || typeof params !== 'object') return {};
  const sanitized = {};
  
  // Prohibited field patterns (strictly forbidden in analytics payloads)
  const piiKeys = /^(name|fullName|applicantName|email|phone|mobile|tel|password|message|notes|address|passport|cv|resume)$/i;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /\+?[0-9\s\-\(\)]{7,}/;

  for (const [key, value] of Object.entries(params)) {
    if (piiKeys.test(key)) {
      continue; // Exclude PII keys entirely
    }
    if (typeof value === 'string') {
      if (emailRegex.test(value)) {
        continue; // Exclude values containing email addresses
      }
      if (phoneRegex.test(value) && value.replace(/[^0-9]/g, '').length >= 7) {
        continue; // Exclude values containing phone numbers
      }
      // Safe truncation to prevent payload bloat
      sanitized[key] = value.slice(0, 150);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.filter(v => typeof v === 'string').map(v => v.slice(0, 50)).slice(0, 10);
    }
  }

  return sanitized;
};

/**
 * Initializes GA4 and dataLayer if measurement ID is present and consent is granted
 */
export const initAnalytics = () => {
  if (typeof window === 'undefined') return;

  // Ensure window.dataLayer exists for GTM/GA4 compatibility
  window.dataLayer = window.dataLayer || [];

  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }

  // Inject GA4 script tag dynamically if ID configured and script not yet injected
  if (GA_MEASUREMENT_ID && hasCookieConsent()) {
    const existingScript = document.getElementById('ga4-script-tag');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'ga4-script-tag';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true,
        send_page_view: false // Managed manually via trackPageView for SPA accuracy
      });
    }
  }
};

/**
 * Central event dispatcher
 */
export const trackEvent = (eventName, rawParams = {}) => {
  if (!eventName || typeof eventName !== 'string') return;

  const sanitized = sanitizeParams(rawParams);
  const eventPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...sanitized
  };

  // Record into internal debug buffer (for testing and verification)
  recentAnalyticsEvents.unshift(eventPayload);
  if (recentAnalyticsEvents.length > MAX_BUFFER_SIZE) {
    recentAnalyticsEvents.pop();
  }

  // Push to dataLayer for GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventPayload);
  }

  // Dispatch to GA4 gtag if consent granted and gtag initialized
  if (typeof window !== 'undefined' && window.gtag && hasCookieConsent()) {
    window.gtag('event', eventName, sanitized);
  }

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.debug(`[Analytics Event: ${eventName}]`, sanitized);
  }
};

/**
 * 1. Track Page View
 */
export const trackPageView = (pagePath, pageTitle, extraParams = {}) => {
  const cleanPath = (pagePath || (typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/'))
    .replace(/^#+/, '');

  trackEvent('page_view', {
    page_path: cleanPath,
    page_title: pageTitle || (typeof document !== 'undefined' ? document.title : 'Revival International'),
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    ...extraParams
  });
};

/**
 * 2. Track Service View
 */
export const trackServiceView = (serviceId, serviceTitle, category = 'Education') => {
  trackEvent('service_view', {
    service_id: serviceId,
    service_title: serviceTitle,
    service_category: category
  });
  trackFunnelStep(2, 'service_view', serviceId);
};

/**
 * 3. Track Service Detail Interaction
 */
export const trackServiceDetailClick = (serviceId, serviceTitle, interactionType = 'view_details') => {
  trackEvent('service_detail_click', {
    service_id: serviceId,
    service_title: serviceTitle,
    interaction_type: interactionType
  });
  trackFunnelStep(3, 'service_detail_interaction', serviceId);
};

/**
 * 4. Track Call-To-Action (CTA) Click
 */
export const trackCtaClick = (ctaText, location, targetServiceId = null) => {
  trackEvent('cta_click', {
    cta_text: ctaText,
    page_location: location,
    target_service_id: targetServiceId || 'general'
  });
  if (targetServiceId) {
    trackFunnelStep(4, 'enquiry_cta_click', targetServiceId);
  }
};

/**
 * 5. Track Enquiry Form Start (Fired only once per form session)
 */
export const trackEnquiryStart = (formType, serviceId = 'general', serviceTitle = '') => {
  const formSessionKey = `${formType}_${serviceId}`;
  if (trackedEnquiryStarts.has(formSessionKey)) {
    return; // Prevent duplicate form start events in the same session
  }
  trackedEnquiryStarts.add(formSessionKey);

  trackEvent('enquiry_form_start', {
    form_type: formType,
    service_id: serviceId,
    service_title: serviceTitle
  });
  trackFunnelStep(5, 'enquiry_form_start', serviceId);
};

/**
 * 6. Track Form Validation Failures
 */
export const trackEnquiryValidationFailure = (formType, serviceId = 'general', failedFields = []) => {
  trackEvent('form_validation_failure', {
    form_type: formType,
    service_id: serviceId,
    failed_field_count: failedFields.length,
    failed_fields: failedFields
  });
};

/**
 * 7. Track Confirmed Successful Conversion
 * Requirement: Fires ONLY after backend confirmation, prevents duplicate firings via referenceNumber deduplication.
 */
export const trackEnquiryConversion = (referenceNumber, serviceId = 'general', serviceTitle = '', category = 'Education', formType = 'service_modal') => {
  if (!referenceNumber) {
    console.warn('[Analytics] Conversion blocked: Missing confirmed referenceNumber.');
    return false;
  }

  // Deduplication check
  if (trackedConversionReferences.has(referenceNumber)) {
    console.warn(`[Analytics] Duplicate conversion prevented for reference: ${referenceNumber}`);
    return false;
  }
  trackedConversionReferences.add(referenceNumber);

  trackEvent('enquiry_conversion', {
    reference_number: referenceNumber,
    service_id: serviceId,
    service_title: serviceTitle,
    service_category: category,
    form_type: formType,
    conversion_type: 'lead_enquiry',
    currency: 'AED',
    value: 1 // Standard conversion milestone unit
  });

  trackFunnelStep(6, 'successful_enquiry_submission', serviceId);
  return true;
};

/**
 * 8. Track Contact Channel Clicks (Phone, Email, WhatsApp)
 */
export const trackContactClick = (channel, destinationLabel = '') => {
  trackEvent('contact_channel_click', {
    contact_channel: channel, // 'phone' | 'email' | 'whatsapp'
    destination_label: destinationLabel
  });
};

/**
 * 9. Track 6-Stage Customer Journey Funnel Steps
 */
export const trackFunnelStep = (stepNumber, stepName, serviceId = 'general') => {
  trackEvent('funnel_step', {
    step_number: stepNumber,
    step_name: stepName,
    service_id: serviceId
  });
};

/**
 * Retrieves the recent analytics event buffer (for testing and debugging)
 */
export const getRecentEvents = () => [...recentAnalyticsEvents];

/**
 * Clears the debug buffer and deduplication sets (useful for automated testing)
 */
export const resetAnalyticsForTest = () => {
  recentAnalyticsEvents.length = 0;
  trackedConversionReferences.clear();
  trackedEnquiryStarts.clear();
};

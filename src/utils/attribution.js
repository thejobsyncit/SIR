/**
 * Revival International — Campaign & Organic Attribution Utility
 * Captures and preserves UTM parameters and referrer across SPA session.
 */

const ATTRIBUTION_STORAGE_KEY = 'sir_attribution';

export const getAttributionData = () => {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}

  // Parse current URL parameters
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source') || null;
  const utmMedium = params.get('utm_medium') || null;
  const utmCampaign = params.get('utm_campaign') || null;
  const utmTerm = params.get('utm_term') || null;
  const utmContent = params.get('utm_content') || null;

  // Determine external referrer
  let referrer = null;
  try {
    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      referrer = document.referrer.slice(0, 200);
    }
  } catch {}

  const attribution = {
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    referrer: referrer || (utmSource ? null : 'organic_direct'),
    capturedAt: new Date().toISOString()
  };

  try {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {}

  return attribution;
};

export const clearAttributionData = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {}
};

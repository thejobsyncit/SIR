/**
 * Safe Browser Storage Utility
 * Prevents DOMException: QuotaExceededError by stripping multi-megabyte base64
 * data strings from localStorage, pruning bloated keys, and falling back gracefully
 * to sessionStorage so the application never crashes.
 */

export const isBulkyDataString = (str) => {
  if (typeof str !== 'string') return false;
  // If it's a base64 data URI (pdf, image, binary) or long raw base64 string > 2KB
  if (str.startsWith('data:') && str.length > 2048) return true;
  if (str.length > 100000) return true;
  return false;
};

/**
 * Recursively strips oversized base64 data URIs from an object or array
 * while preserving essential metadata (filenames, sizes, statuses, ids).
 */
export const stripBulkyDataForStorage = (data) => {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => stripBulkyDataForStorage(item));
  }

  const clean = { ...data };

  // Strip huge resumeUrl / fileUrl base64 data URIs
  if (isBulkyDataString(clean.resumeUrl)) {
    clean.resumeUrl = null;
  }
  if (isBulkyDataString(clean.resumeBase64)) {
    clean.resumeBase64 = null;
  }
  if (isBulkyDataString(clean.fileUrl)) {
    clean.fileUrl = null;
  }
  if (isBulkyDataString(clean.dataUrl)) {
    clean.dataUrl = null;
  }

  // Strip oversized avatar data URIs (> 50KB)
  if (typeof clean.avatar === 'string' && clean.avatar.startsWith('data:') && clean.avatar.length > 50000) {
    clean.avatar = null;
  }

  // If this object is a candidates DB map (keyed by email), sanitize child profiles
  for (const key of Object.keys(clean)) {
    if (clean[key] && typeof clean[key] === 'object' && !Array.isArray(clean[key]) && clean[key].email) {
      clean[key] = stripBulkyDataForStorage(clean[key]);
    } else if (key === 'applications' && Array.isArray(clean[key])) {
      clean[key] = clean[key].map(app => stripBulkyDataForStorage(app));
    }
  }

  return clean;
};

/**
 * Prunes known oversized or temporary cache entries from localStorage
 */
export const pruneBulkyStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem('sir_active_resume');
    localStorage.removeItem('sir_active_resume_name');

    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith('sir_resume_')) {
        toRemove.push(k);
      }
    }
    toRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (_) {}
    });
  } catch (_) {}
};

// Auto-run cleanup on module initialization to free up any saturated quota
if (typeof window !== 'undefined') {
  pruneBulkyStorage();
}

/**
 * Safe localStorage.setItem with automatic quota exceeded recovery and sessionStorage fallback
 */
export const safeStorageSetItem = (key, value) => {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  let stringValue = value;
  if (typeof value !== 'string') {
    try {
      const sanitized = stripBulkyDataForStorage(value);
      stringValue = JSON.stringify(sanitized);
    } catch (_) {
      try {
        stringValue = JSON.stringify(value);
      } catch {
        return false;
      }
    }
  }

  try {
    localStorage.setItem(key, stringValue);
    return true;
  } catch (err) {
    console.warn(`[safeStorage] localStorage write failed for "${key}", attempting cleanup:`, err?.message);

    // 1. Evict bulky caches
    pruneBulkyStorage();

    // 2. Retry setting item
    try {
      localStorage.setItem(key, stringValue);
      return true;
    } catch (retryErr) {
      console.warn(`[safeStorage] Retry after prune failed for "${key}", falling back to sessionStorage:`, retryErr?.message);
      // 3. Fallback to sessionStorage so active session continues safely
      try {
        if (window.sessionStorage) {
          sessionStorage.setItem(key, stringValue);
          return true;
        }
      } catch (_) {}
      return false;
    }
  }
};

/**
 * Safe getter that checks localStorage then sessionStorage
 */
export const safeStorageGetItem = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(key);
    if (val !== null) return val;
  } catch (_) {}
  try {
    if (window.sessionStorage) {
      return sessionStorage.getItem(key);
    }
  } catch (_) {}
  return null;
};

/**
 * Safe remover that clears from both localStorage and sessionStorage
 */
export const safeStorageRemoveItem = (key) => {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch (_) {}
  try { if (window.sessionStorage) sessionStorage.removeItem(key); } catch (_) {}
};

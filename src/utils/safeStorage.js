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

  const bulkyFields = [
    'resumeUrl',
    'resumeBase64',
    'resumeData',
    'fileUrl',
    'fileData',
    'dataUrl',
    'passportUrl',
    'passportFile',
    'documentUrl',
    'photoUrl'
  ];

  for (const field of bulkyFields) {
    if (isBulkyDataString(clean[field])) {
      clean[field] = null;
    }
  }

  // Strip oversized avatar data URIs (> 15KB) from storage caches
  if (typeof clean.avatar === 'string' && clean.avatar.startsWith('data:') && clean.avatar.length > 15000) {
    clean.avatar = null;
  }

  // Strip any remaining oversized base64/data URI fields (> 2KB data URI or > 100KB raw string)
  for (const key of Object.keys(clean)) {
    const val = clean[key];
    if (typeof val === 'string' && isBulkyDataString(val)) {
      clean[key] = null;
    } else if (val && typeof val === 'object' && !Array.isArray(val) && val.email) {
      clean[key] = stripBulkyDataForStorage(val);
    } else if (key === 'applications' && Array.isArray(val)) {
      clean[key] = val.map(app => stripBulkyDataForStorage(app));
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
    // Disposable runtime i18n cache can grow to several MB across languages; static JSON + API repopulate it on demand
    localStorage.removeItem('sir_i18n_cache_v2');

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

    // Shrink bloated array/map caches that may still contain legacy base64 blobs
    const shrinkableKeys = ['crm_candidates', 'sir_job_applications', 'sir_candidates_db', 'crm_auditLogs'];
    for (const k of shrinkableKeys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw || raw.length < 50000) continue;
        const parsed = JSON.parse(raw);
        let stripped = stripBulkyDataForStorage(parsed);
        if (Array.isArray(stripped) && stripped.length > 100) {
          stripped = stripped.slice(0, 100);
        }
        const nextStr = JSON.stringify(stripped);
        if (nextStr.length < raw.length) {
          localStorage.setItem(k, nextStr);
        } else if (raw.length > 500000) {
          localStorage.removeItem(k);
        }
      } catch (_) {
        try { localStorage.removeItem(k); } catch (__) {}
      }
    }
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

  const serialize = (val) => {
    if (typeof val === 'string') return val;
    try {
      return JSON.stringify(stripBulkyDataForStorage(val));
    } catch (_) {
      try {
        return JSON.stringify(val);
      } catch {
        return null;
      }
    }
  };

  const stringValue = serialize(value);
  if (stringValue === null) return false;

  try {
    localStorage.setItem(key, stringValue);
    return true;
  } catch (err) {
    console.warn(`[safeStorage] localStorage write failed for "${key}", attempting cleanup:`, err?.message);

    // 1. Evict bulky/disposable caches
    pruneBulkyStorage();

    // 2. Retry setting item (or compact head slice if it's a large array cache)
    try {
      localStorage.setItem(key, stringValue);
      return true;
    } catch (retryErr) {
      if (Array.isArray(value) && value.length > 50) {
        try {
          const compact = serialize(value.slice(0, 50));
          if (compact !== null) {
            localStorage.setItem(key, compact);
            return true;
          }
        } catch (_) {}
      }

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

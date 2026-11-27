// Full-site DOM translation engine with preloaded i18n JSON resources,
// synchronous instant switching, WeakMap original-text preservation, and parallel /api/translate fallback.

const originalNodeTextMap = new WeakMap();
const lastTranslatedTextMap = new WeakMap();
const originalPlaceholderMap = new WeakMap();
const lastTranslatedPlaceholderMap = new WeakMap();
const originalTitleMap = new WeakMap();
const lastTranslatedTitleMap = new WeakMap();

const CACHE_KEY = 'sir_i18n_cache_v2';
let memoryCache = null;
const loadedStaticDicts = {};
const dictLoadPromises = {};
let activeLangToken = 'EN';
let isApplyingDomTranslation = false;

export const isTranslatingDom = () => isApplyingDomTranslation;

const getCache = () => {
  if (memoryCache) return memoryCache;
  try {
    memoryCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    memoryCache = {};
  }
  return memoryCache;
};

const saveCache = () => {
  try {
    if (memoryCache) {
      const serialized = JSON.stringify(memoryCache);
      // Keep runtime translation cache bounded so it never starves app localStorage quota
      if (serialized.length > 500000) {
        const nextCache = {};
        if (memoryCache[activeLangToken]) {
          nextCache[activeLangToken] = memoryCache[activeLangToken];
        }
        memoryCache = nextCache;
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
    }
  } catch {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch { }
  }
};

const normalizeKeyText = (s) =>
  String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u00A0\s]+/g, ' ')
    .trim();

const buildDictLookup = (raw) => {
  const exact = {};
  const lower = {};
  for (const [k, v] of Object.entries(raw || {})) {
    const decodedV = String(v).replace(/&amp;/g, '&');
    const decodedK = normalizeKeyText(k);
    exact[k] = decodedV;
    exact[decodedK] = decodedV;
    lower[decodedK.toLowerCase()] = decodedV;
  }
  return { exact, lower };
};

const loadStaticDict = (tl) => {
  if (loadedStaticDicts[tl]) return Promise.resolve(loadedStaticDicts[tl]);
  if (dictLoadPromises[tl]) return dictLoadPromises[tl];

  dictLoadPromises[tl] = (async () => {
    try {
      let mod = null;
      if (tl === 'hi') mod = await import('../data/i18n/hi.json');
      else if (tl === 'ar') mod = await import('../data/i18n/ar.json');
      else if (tl === 'fr') mod = await import('../data/i18n/fr.json');
      else if (tl === 'de') mod = await import('../data/i18n/de.json');
      loadedStaticDicts[tl] = buildDictLookup((mod && mod.default) || {});
    } catch {
      loadedStaticDicts[tl] = { exact: {}, lower: {} };
    }
    return loadedStaticDicts[tl];
  })();

  return dictLoadPromises[tl];
};

// Preload all language dictionaries in background / on dropdown hover so click is instant (0ms wait)
let preloadedAll = false;
export const preloadLanguageDictionaries = (preferredLang) => {
  const pref = String(preferredLang || '').toLowerCase();
  if (pref && ['hi', 'ar', 'fr', 'de'].includes(pref)) {
    loadStaticDict(pref);
  }
  if (preloadedAll) return;
  preloadedAll = true;
  ['hi', 'ar', 'fr', 'de'].forEach((code) => {
    loadStaticDict(code);
  });
};

const isProtectedText = (str) => {
  const s = (str || '').trim();
  if (!s) return true;
  // Use Unicode letter check (\p{L}) instead of \W so non-Latin scripts (Arabic, Hindi, etc.) are never misclassified as punctuation
  if (!/\p{L}/u.test(s)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return true; // email
  if (/^https?:\/\//i.test(s) || /^www\./i.test(s)) return true; // URL
  if (/^REV-[A-Z0-9-]+$/i.test(s)) return true; // Reference ID
  if (/^(The Revival International|Revival International|The Revival CRM|Revival AI Advisor)$/i.test(s)) return true;
  return false;
};

const isInternalPortalRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const hash = window.location.hash.replace(/^#/, '').split('?')[0].toLowerCase();
  return (
    path === 'crm' || path.startsWith('crm/') ||
    path === 'erp' || path.startsWith('erp/') ||
    path === 'superadmin-erp' || path.startsWith('superadmin-erp/') ||
    hash === 'crm' || hash.startsWith('crm/') ||
    hash === 'erp' || hash.startsWith('erp/') ||
    hash === 'superadmin-erp'
  );
};

// Start preloading public site dictionaries immediately on module load (0ms delay)
if (typeof window !== 'undefined' && !isInternalPortalRoute()) {
  preloadLanguageDictionaries();
}

const shouldSkipElement = (el) => {
  if (!el || el.nodeType !== 1) return false;
  const tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE' || tag === 'SVG') {
    return true;
  }
  if (el.id === 'crm-app-root' || el.closest('#crm-app-root, .notranslate, [translate="no"]')) {
    return true;
  }
  return false;
};

const collectTranslatableItems = (root = document.body) => {
  if (!root) return { textNodes: [], placeholders: [], titledEls: [] };
  const textNodes = [];
  const placeholders = [];
  const titledEls = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
      if (originalNodeTextMap.has(node)) return NodeFilter.FILTER_ACCEPT;
      const raw = node.nodeValue || '';
      if (!raw.trim() || isProtectedText(raw)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let current;
  while ((current = walker.nextNode())) {
    const val = current.nodeValue;
    if (!originalNodeTextMap.has(current)) {
      originalNodeTextMap.set(current, val);
    } else if (
      val !== originalNodeTextMap.get(current) &&
      val !== lastTranslatedTextMap.get(current)
    ) {
      // React updated the underlying English text inside this reused text node
      originalNodeTextMap.set(current, val);
    }
    textNodes.push(current);
  }

  root.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((inp) => {
    if (shouldSkipElement(inp)) return;
    const ph = inp.getAttribute('placeholder') || '';
    if (!originalPlaceholderMap.has(inp)) {
      originalPlaceholderMap.set(inp, ph);
    } else if (
      ph !== originalPlaceholderMap.get(inp) &&
      ph !== lastTranslatedPlaceholderMap.get(inp)
    ) {
      originalPlaceholderMap.set(inp, ph);
    }
    const orig = originalPlaceholderMap.get(inp);
    if (orig && !isProtectedText(orig)) {
      placeholders.push(inp);
    }
  });

  root.querySelectorAll('[title]').forEach((el) => {
    if (shouldSkipElement(el)) return;
    const ttl = el.getAttribute('title') || '';
    if (!originalTitleMap.has(el)) {
      originalTitleMap.set(el, ttl);
    } else if (
      ttl !== originalTitleMap.get(el) &&
      ttl !== lastTranslatedTitleMap.get(el)
    ) {
      originalTitleMap.set(el, ttl);
    }
    const orig = originalTitleMap.get(el);
    if (orig && !isProtectedText(orig)) {
      titledEls.push(el);
    }
  });

  return { textNodes, placeholders, titledEls };
};

export const restoreOriginalEnglish = (root = document.body) => {
  if (!root) return;
  activeLangToken = 'EN';
  isApplyingDomTranslation = true;
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (originalNodeTextMap.has(node)) {
        const orig = originalNodeTextMap.get(node);
        if (node.nodeValue !== orig) {
          node.nodeValue = orig;
        }
        lastTranslatedTextMap.delete(node);
      }
    }
    root.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((inp) => {
      if (originalPlaceholderMap.has(inp)) {
        inp.setAttribute('placeholder', originalPlaceholderMap.get(inp));
        lastTranslatedPlaceholderMap.delete(inp);
      }
    });
    root.querySelectorAll('[title]').forEach((el) => {
      if (originalTitleMap.has(el)) {
        el.setAttribute('title', originalTitleMap.get(el));
        lastTranslatedTitleMap.delete(el);
      }
    });
  } finally {
    isApplyingDomTranslation = false;
  }
};

const applyKnownTranslations = ({ tl, staticDict, cache, textNodes, placeholders, titledEls, collectMissing = false }) => {
  const missingSet = new Set();

  const lookup = (trimmed) => {
    const norm = normalizeKeyText(trimmed);
    const direct =
      staticDict.exact[trimmed] ||
      staticDict.exact[norm] ||
      staticDict.lower[norm.toLowerCase()] ||
      cache[tl][trimmed] ||
      cache[tl][norm];
    if (direct) return direct;

    const bulletMatch = norm.match(/^([•✓→←+\-*]\s+)(.+)$/);
    if (bulletMatch) {
      const inner = normalizeKeyText(bulletMatch[2]);
      const innerHit = staticDict.exact[inner] || staticDict.lower[inner.toLowerCase()] || cache[tl][inner];
      if (innerHit) return `${bulletMatch[1]}${innerHit}`;
    }

    const parenCountMatch = norm.match(/^(.+?)\s*\((\d+\+?)\)$/);
    if (parenCountMatch) {
      const base = normalizeKeyText(parenCountMatch[1]);
      const baseHit = staticDict.exact[base] || staticDict.lower[base.toLowerCase()] || cache[tl][base];
      if (baseHit) return `${baseHit} (${parenCountMatch[2]})`;
    }

    return null;
  };

  isApplyingDomTranslation = true;
  try {
    for (const node of textNodes) {
      const orig = originalNodeTextMap.get(node) || '';
      const trimmed = orig.trim();
      if (!trimmed) continue;
      const hit = lookup(trimmed);
      if (hit) {
        const leading = orig.match(/^\s*/)?.[0] || '';
        const trailing = orig.match(/\s*$/)?.[0] || '';
        const nextVal = `${leading}${hit}${trailing}`;
        lastTranslatedTextMap.set(node, nextVal);
        if (node.nodeValue !== nextVal) node.nodeValue = nextVal;
      } else {
        // Never leave stale text from a previously selected language in the DOM
        if (node.nodeValue !== orig) node.nodeValue = orig;
        lastTranslatedTextMap.delete(node);
        if (collectMissing) missingSet.add(trimmed);
      }
    }

    for (const inp of placeholders) {
      const orig = (originalPlaceholderMap.get(inp) || '').trim();
      if (!orig) continue;
      const hit = lookup(orig);
      if (hit) {
        lastTranslatedPlaceholderMap.set(inp, hit);
        if (inp.getAttribute('placeholder') !== hit) inp.setAttribute('placeholder', hit);
      } else {
        const fullOrig = originalPlaceholderMap.get(inp) || '';
        if (inp.getAttribute('placeholder') !== fullOrig) inp.setAttribute('placeholder', fullOrig);
        lastTranslatedPlaceholderMap.delete(inp);
        if (collectMissing) missingSet.add(orig);
      }
    }

    for (const el of titledEls) {
      const orig = (originalTitleMap.get(el) || '').trim();
      if (!orig) continue;
      const hit = lookup(orig);
      if (hit) {
        lastTranslatedTitleMap.set(el, hit);
        if (el.getAttribute('title') !== hit) el.setAttribute('title', hit);
      } else {
        const fullOrig = originalTitleMap.get(el) || '';
        if (el.getAttribute('title') !== fullOrig) el.setAttribute('title', fullOrig);
        lastTranslatedTitleMap.delete(el);
        if (collectMissing) missingSet.add(orig);
      }
    }
  } finally {
    isApplyingDomTranslation = false;
  }

  return Array.from(missingSet);
};

export const translateDomToLanguage = async (langCode, root = document.body) => {
  if (isInternalPortalRoute()) {
    restoreOriginalEnglish(root);
    return;
  }

  const code = String(langCode || 'EN').toUpperCase();
  activeLangToken = code;

  if (code === 'EN') {
    restoreOriginalEnglish(root);
    return;
  }

  const tl = code.toLowerCase();
  const cache = getCache();
  if (!cache[tl]) cache[tl] = {};

  // Synchronous instant pass if dictionary is already preloaded (0ms wait!)
  const staticDict = loadedStaticDicts[tl] || await loadStaticDict(tl);
  if (activeLangToken !== code) return;

  const { textNodes, placeholders, titledEls } = collectTranslatableItems(root);
  const missing = applyKnownTranslations({ tl, staticDict, cache, textNodes, placeholders, titledEls, collectMissing: true });
  if (missing.length === 0) return;

  // Fetch any remaining dynamic/uncached strings in parallel chunks and apply incrementally as each arrives
  const chunks = [];
  for (let i = 0; i < missing.length; i += 35) {
    chunks.push(missing.slice(i, i + 35));
  }

  const CONCURRENCY = 3;
  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    if (activeLangToken !== code) return;
    const batch = chunks.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (chunk) => {
        try {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timer = controller ? setTimeout(() => controller.abort(), 5000) : null;
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetLang: tl, texts: chunk }),
            ...(controller ? { signal: controller.signal } : {})
          });
          if (timer) clearTimeout(timer);
          if (!res.ok) return;
          const data = await res.json();
          if (data.success && data.translations && activeLangToken === code) {
            Object.assign(cache[tl], data.translations);
            saveCache();
            applyKnownTranslations({ tl, staticDict, cache, textNodes, placeholders, titledEls, collectMissing: false });
          }
        } catch {
          // Ignore network/timeout errors
        }
      })
    );
  }
};

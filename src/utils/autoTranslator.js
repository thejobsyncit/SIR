// Full-site DOM translation engine with centralized i18n JSON resources,
// WeakMap original-text preservation, dropdown <option> support, and /api/translate fallback.

const originalNodeTextMap = new WeakMap();
const originalPlaceholderMap = new WeakMap();
const originalTitleMap = new WeakMap();

const CACHE_KEY = 'sir_i18n_cache_v2';
let memoryCache = null;
const loadedStaticDicts = {};

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
      localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
    }
  } catch {
    // Ignore storage quota errors
  }
};

const loadStaticDict = async (tl) => {
  if (loadedStaticDicts[tl]) return loadedStaticDicts[tl];
  try {
    let mod = null;
    if (tl === 'hi') mod = await import('../data/i18n/hi.json');
    else if (tl === 'ar') mod = await import('../data/i18n/ar.json');
    else if (tl === 'fr') mod = await import('../data/i18n/fr.json');
    else if (tl === 'de') mod = await import('../data/i18n/de.json');
    loadedStaticDicts[tl] = (mod && mod.default) || {};
  } catch {
    loadedStaticDicts[tl] = {};
  }
  return loadedStaticDicts[tl];
};

const isProtectedText = (str) => {
  const s = (str || '').trim();
  if (!s) return true;
  if (/^[\d\s\W_]+$/.test(s)) return true;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return true; // email
  if (/^https?:\/\//i.test(s) || /^www\./i.test(s)) return true; // URL
  if (/^REV-[A-Z0-9-]+$/i.test(s)) return true; // Reference ID
  if (/^(The Revival International|Revival International|The Revival CRM|Revival AI Advisor)$/i.test(s)) return true;
  return false;
};

const shouldSkipElement = (el) => {
  if (!el || el.nodeType !== 1) return false;
  const tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE' || tag === 'SVG') {
    return true;
  }
  if (el.closest('.notranslate, [translate="no"]')) {
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
      const raw = node.nodeValue || '';
      if (!raw.trim() || isProtectedText(raw)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let current;
  while ((current = walker.nextNode())) {
    if (!originalNodeTextMap.has(current)) {
      originalNodeTextMap.set(current, current.nodeValue);
    }
    textNodes.push(current);
  }

  root.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((inp) => {
    if (shouldSkipElement(inp)) return;
    if (!originalPlaceholderMap.has(inp)) {
      originalPlaceholderMap.set(inp, inp.getAttribute('placeholder') || '');
    }
    const orig = originalPlaceholderMap.get(inp);
    if (orig && !isProtectedText(orig)) {
      placeholders.push(inp);
    }
  });

  root.querySelectorAll('[title]').forEach((el) => {
    if (shouldSkipElement(el)) return;
    if (!originalTitleMap.has(el)) {
      originalTitleMap.set(el, el.getAttribute('title') || '');
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
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (originalNodeTextMap.has(node)) {
      const orig = originalNodeTextMap.get(node);
      if (node.nodeValue !== orig) {
        node.nodeValue = orig;
      }
    }
  }
  root.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((inp) => {
    if (originalPlaceholderMap.has(inp)) {
      inp.setAttribute('placeholder', originalPlaceholderMap.get(inp));
    }
  });
  root.querySelectorAll('[title]').forEach((el) => {
    if (originalTitleMap.has(el)) {
      el.setAttribute('title', originalTitleMap.get(el));
    }
  });
};

export const translateDomToLanguage = async (langCode, root = document.body) => {
  const code = String(langCode || 'EN').toUpperCase();
  if (code === 'EN') {
    restoreOriginalEnglish(root);
    return;
  }

  const tl = code.toLowerCase();
  const staticDict = await loadStaticDict(tl);
  const { textNodes, placeholders, titledEls } = collectTranslatableItems(root);
  const cache = getCache();
  if (!cache[tl]) cache[tl] = {};

  const missingSet = new Set();

  const lookup = (trimmed) => {
    const norm = trimmed.replace(/\s+/g, ' ');
    return staticDict[trimmed] || staticDict[norm] || cache[tl][trimmed] || cache[tl][norm];
  };

  for (const node of textNodes) {
    const orig = originalNodeTextMap.get(node) || '';
    const trimmed = orig.trim();
    if (!trimmed) continue;
    const hit = lookup(trimmed);
    if (hit) {
      const leading = orig.match(/^\s*/)?.[0] || '';
      const trailing = orig.match(/\s*$/)?.[0] || '';
      const nextVal = `${leading}${hit}${trailing}`;
      if (node.nodeValue !== nextVal) node.nodeValue = nextVal;
    } else {
      missingSet.add(trimmed);
    }
  }

  for (const inp of placeholders) {
    const orig = (originalPlaceholderMap.get(inp) || '').trim();
    if (!orig) continue;
    const hit = lookup(orig);
    if (hit) {
      inp.setAttribute('placeholder', hit);
    } else {
      missingSet.add(orig);
    }
  }

  for (const el of titledEls) {
    const orig = (originalTitleMap.get(el) || '').trim();
    if (!orig) continue;
    const hit = lookup(orig);
    if (hit) {
      el.setAttribute('title', hit);
    } else {
      missingSet.add(orig);
    }
  }

  const missing = Array.from(missingSet);
  if (missing.length === 0) return;

  // Fetch remaining dynamic/DB strings in batches via /api/translate
  for (let i = 0; i < missing.length; i += 40) {
    const chunk = missing.slice(i, i + 40);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang: tl, texts: chunk })
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.success && data.translations) {
        Object.assign(cache[tl], data.translations);
      }
    } catch {
      // Ignore network errors
    }
  }
  saveCache();

  // Apply newly fetched translations
  for (const node of textNodes) {
    const orig = originalNodeTextMap.get(node) || '';
    const trimmed = orig.trim();
    const hit = trimmed && lookup(trimmed);
    if (hit) {
      const leading = orig.match(/^\s*/)?.[0] || '';
      const trailing = orig.match(/\s*$/)?.[0] || '';
      const nextVal = `${leading}${hit}${trailing}`;
      if (node.nodeValue !== nextVal) node.nodeValue = nextVal;
    }
  }
  for (const inp of placeholders) {
    const orig = (originalPlaceholderMap.get(inp) || '').trim();
    const hit = orig && lookup(orig);
    if (hit) inp.setAttribute('placeholder', hit);
  }
  for (const el of titledEls) {
    const orig = (originalTitleMap.get(el) || '').trim();
    const hit = orig && lookup(orig);
    if (hit) el.setAttribute('title', hit);
  }
};

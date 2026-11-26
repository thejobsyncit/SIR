// Full-site DOM translation engine with WeakMap original-text preservation and localStorage caching

const originalNodeTextMap = new WeakMap();
const originalPlaceholderMap = new WeakMap();

const CACHE_KEY = 'sir_i18n_cache_v1';
let memoryCache = null;

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

const shouldSkipElement = (el) => {
  if (!el || el.nodeType !== 1) return false;
  const tag = el.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'CODE' || tag === 'PRE' || tag === 'SVG' || tag === 'SELECT' || tag === 'OPTION') {
    return true;
  }
  if (el.closest('.notranslate, [translate="no"]')) {
    return true;
  }
  return false;
};

const collectTranslatableItems = (root = document.body) => {
  if (!root) return { textNodes: [], placeholders: [] };
  const textNodes = [];
  const placeholders = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
      const raw = node.nodeValue || '';
      if (!raw.trim() || /^[\d\s\W_]+$/.test(raw.trim())) return NodeFilter.FILTER_REJECT;
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

  const inputs = root.querySelectorAll('input[placeholder], textarea[placeholder]');
  inputs.forEach((inp) => {
    if (shouldSkipElement(inp)) return;
    if (!originalPlaceholderMap.has(inp)) {
      originalPlaceholderMap.set(inp, inp.getAttribute('placeholder') || '');
    }
    const orig = originalPlaceholderMap.get(inp);
    if (orig && orig.trim()) {
      placeholders.push(inp);
    }
  });

  return { textNodes, placeholders };
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
};

export const translateDomToLanguage = async (langCode, root = document.body) => {
  const code = String(langCode || 'EN').toUpperCase();
  if (code === 'EN') {
    restoreOriginalEnglish(root);
    return;
  }

  const tl = code.toLowerCase();
  const { textNodes, placeholders } = collectTranslatableItems(root);
  const cache = getCache();
  if (!cache[tl]) cache[tl] = {};

  const missingSet = new Set();

  for (const node of textNodes) {
    const orig = originalNodeTextMap.get(node) || '';
    const trimmed = orig.trim();
    if (!trimmed) continue;
    if (cache[tl][trimmed]) {
      const leading = orig.match(/^\s*/)?.[0] || '';
      const trailing = orig.match(/\s*$/)?.[0] || '';
      const nextVal = `${leading}${cache[tl][trimmed]}${trailing}`;
      if (node.nodeValue !== nextVal) node.nodeValue = nextVal;
    } else {
      missingSet.add(trimmed);
    }
  }

  for (const inp of placeholders) {
    const orig = (originalPlaceholderMap.get(inp) || '').trim();
    if (!orig) continue;
    if (cache[tl][orig]) {
      inp.setAttribute('placeholder', cache[tl][orig]);
    } else {
      missingSet.add(orig);
    }
  }

  const missing = Array.from(missingSet);
  if (missing.length === 0) return;

  // Fetch in batches of 80 strings
  for (let i = 0; i < missing.length; i += 80) {
    const chunk = missing.slice(i, i + 80);
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
    if (trimmed && cache[tl][trimmed]) {
      const leading = orig.match(/^\s*/)?.[0] || '';
      const trailing = orig.match(/\s*$/)?.[0] || '';
      node.nodeValue = `${leading}${cache[tl][trimmed]}${trailing}`;
    }
  }
  for (const inp of placeholders) {
    const orig = (originalPlaceholderMap.get(inp) || '').trim();
    if (orig && cache[tl][orig]) {
      inp.setAttribute('placeholder', cache[tl][orig]);
    }
  }
};

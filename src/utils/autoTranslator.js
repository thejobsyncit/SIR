// Full-site DOM translation engine with WeakMap original-text preservation and localStorage caching

const originalNodeTextMap = new WeakMap();
const originalPlaceholderMap = new WeakMap();

const CACHE_KEY = 'sir_i18n_cache_v1';
let memoryCache = null;

const BUILTIN_DICTIONARY = {
  hi: {
    'Home': 'होम',
    'About Us': 'हमारे बारे में',
    'Services': 'सेवाएं',
    'Jobs': 'नौकरियां',
    'Contact Us': 'संपर्क करें',
    'Candidate Login': 'उम्मीदवार लॉगिन',
    'CRM Login': 'सीआरएम लॉगिन',
    'Enquire Now': 'अभी पूछताछ करें',
    'Explore All 6 Services': 'सभी 6 सेवाएं देखें',
    'International Consulting': 'अंतर्राष्ट्रीय परामर्श',
    'College Admission Assistance': 'कॉलेज प्रवेश सहायता',
    'School Student Career Guidance': 'स्कूल छात्र करियर मार्गदर्शन',
    'International Admissions': 'अंतर्राष्ट्रीय प्रवेश',
    'Academy for School Students': 'स्कूली छात्रों के लिए अकादमी',
    'Executive Seminars & Language Prep': 'कार्यकारी सेमिनार और भाषा तैयारी',
    'Contact The Revival International': 'द रिवाइवल इंटरनेशनल से संपर्क करें',
    'Send Direct Inquiry or Consultation Request': 'सीधी पूछताछ या परामर्श अनुरोध भेजें',
    'First Name': 'पहला नाम',
    'Last Name': 'अंतिम नाम',
    'Company': 'कंपनी',
    'Email': 'ईमेल',
    'Mobile Number': 'मोबाइल नंबर',
    'Reason for Contact': 'संपर्क का कारण',
    'Message': 'संदेश',
    'Submit': 'जमा करें',
    'Privacy Policy': 'गोपनीयता नीति',
    'Terms & Conditions': 'नियम एवं शर्तें',
    'Quick Links': 'त्वरित लिंक',
    'Our Services': 'हमारी सेवाएं',
    'Dubai Global HQ': 'दुबई ग्लोबल मुख्यालय',
    'India Operations Hub': 'भारत संचालन केंद्र',
    'View Dubai HQ on Google Maps': 'गूगल मैप्स पर दुबई मुख्यालय देखें',
    'Apply Now': 'अभी आवेदन करें',
    'Learn More': 'अधिक जानें',
    'Search': 'खोजें'
  },
  ar: {
    'Home': 'الرئيسية',
    'About Us': 'من نحن',
    'Services': 'الخدمات',
    'Jobs': 'الوظائف',
    'Contact Us': 'اتصل بنا',
    'Candidate Login': 'دخول المرشح',
    'CRM Login': 'دخول النظام',
    'Enquire Now': 'استفسر الآن',
    'Explore All 6 Services': 'استكشف جميع الخدمات الست',
    'International Consulting': 'الاستشارات الدولية',
    'College Admission Assistance': 'مساعدة القبول الجامعي',
    'School Student Career Guidance': 'التوجيه المهني للطلاب',
    'International Admissions': 'القبول الدولي',
    'Academy for School Students': 'أكاديمية طلاب المدارس',
    'Executive Seminars & Language Prep': 'الندوات التنفيذية وإعداد اللغة',
    'Contact The Revival International': 'تواصل مع ذا ريفايفال إنترناشيونال',
    'First Name': 'الاسم الأول',
    'Last Name': 'اسم العائلة',
    'Company': 'الشركة',
    'Email': 'البريد الإلكتروني',
    'Mobile Number': 'رقم الجوال',
    'Reason for Contact': 'سبب التواصل',
    'Message': 'الرسالة',
    'Submit': 'إرسال',
    'Privacy Policy': 'سياسة الخصوصية',
    'Terms & Conditions': 'الشروط والأحكام',
    'Quick Links': 'روابط سريعة',
    'Our Services': 'خدماتنا',
    'Apply Now': 'قدم الآن',
    'Learn More': 'اعرف المزيد',
    'Search': 'بحث'
  },
  fr: {
    'Home': 'Accueil',
    'About Us': 'À propos',
    'Services': 'Services',
    'Jobs': 'Emplois',
    'Contact Us': 'Contactez-nous',
    'Candidate Login': 'Connexion Candidat',
    'CRM Login': 'Connexion CRM',
    'Enquire Now': 'Demander maintenant',
    'Explore All 6 Services': 'Découvrir les 6 services',
    'International Consulting': 'Conseil International',
    'College Admission Assistance': 'Aide à l’admission universitaire',
    'School Student Career Guidance': 'Orientation scolaire et carrière',
    'International Admissions': 'Admissions Internationales',
    'Academy for School Students': 'Académie pour élèves',
    'Executive Seminars & Language Prep': 'Séminaires & Préparation linguistique',
    'Contact The Revival International': 'Contacter The Revival International',
    'First Name': 'Prénom',
    'Last Name': 'Nom',
    'Company': 'Entreprise',
    'Email': 'E-mail',
    'Mobile Number': 'Numéro de téléphone',
    'Reason for Contact': 'Motif du contact',
    'Message': 'Message',
    'Submit': 'Envoyer',
    'Privacy Policy': 'Politique de confidentialité',
    'Terms & Conditions': 'Conditions générales',
    'Quick Links': 'Liens rapides',
    'Our Services': 'Nos services',
    'Apply Now': 'Postuler maintenant',
    'Learn More': 'En savoir plus',
    'Search': 'Rechercher'
  },
  de: {
    'Home': 'Startseite',
    'About Us': 'Über uns',
    'Services': 'Leistungen',
    'Jobs': 'Stellenangebote',
    'Contact Us': 'Kontakt',
    'Candidate Login': 'Kandidaten-Login',
    'CRM Login': 'CRM-Login',
    'Enquire Now': 'Jetzt anfragen',
    'Explore All 6 Services': 'Alle 6 Leistungen entdecken',
    'International Consulting': 'Internationale Beratung',
    'College Admission Assistance': 'Studienzulassungsberatung',
    'School Student Career Guidance': 'Berufsberatung für Schüler',
    'International Admissions': 'Internationale Zulassungen',
    'Academy for School Students': 'Akademie für Schüler',
    'Executive Seminars & Language Prep': 'Seminare & Sprachvorbereitung',
    'Contact The Revival International': 'Kontaktieren Sie The Revival International',
    'First Name': 'Vorname',
    'Last Name': 'Nachname',
    'Company': 'Unternehmen',
    'Email': 'E-Mail',
    'Mobile Number': 'Mobilnummer',
    'Reason for Contact': 'Kontaktgrund',
    'Message': 'Nachricht',
    'Submit': 'Absenden',
    'Privacy Policy': 'Datenschutzrichtlinie',
    'Terms & Conditions': 'Allgemeine Geschäftsbedingungen',
    'Quick Links': 'Schnelllinks',
    'Our Services': 'Unsere Leistungen',
    'Apply Now': 'Jetzt bewerben',
    'Learn More': 'Mehr erfahren',
    'Search': 'Suchen'
  }
};

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
  const builtin = BUILTIN_DICTIONARY[tl] || {};

  const missingSet = new Set();

  for (const node of textNodes) {
    const orig = originalNodeTextMap.get(node) || '';
    const trimmed = orig.trim();
    if (!trimmed) continue;
    const hit = builtin[trimmed] || cache[tl][trimmed];
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
    const hit = builtin[orig] || cache[tl][orig];
    if (hit) {
      inp.setAttribute('placeholder', hit);
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

/**
 * Country-Aware Phone Validation Utility (Issue #6)
 * Validates international numbers across key operational corridors:
 * UAE (9 digits after +971), India (+91 10 digits), KSA (+966 9 digits), 
 * Qatar, Oman, Kuwait, Bahrain, UK, and USA.
 */

export const SUPPORTED_COUNTRY_CODES = [
  {
    country: 'United Arab Emirates',
    code: 'AE',
    dialCode: '+971',
    flag: '🇦🇪',
    example: '50 123 4567',
    digitsLength: 9, // Exactly 9 digits after +971
    regex: /^(?:50|52|54|55|56|58)\d{7}$/,
    description: 'UAE Mobile (9 digits, starts with 50, 52, 54, 55, 56, 58)'
  },
  {
    country: 'India',
    code: 'IN',
    dialCode: '+91',
    flag: '🇮🇳',
    example: '98765 43210',
    digitsLength: 10, // Exactly 10 digits
    regex: /^[6-9]\d{9}$/,
    description: 'India Mobile (10 digits, starts with 6, 7, 8, 9)'
  },
  {
    country: 'Saudi Arabia',
    code: 'SA',
    dialCode: '+966',
    flag: '🇸🇦',
    example: '50 123 4567',
    digitsLength: 9,
    regex: /^5\d{8}$/,
    description: 'KSA Mobile (9 digits, starts with 5)'
  },
  {
    country: 'Qatar',
    code: 'QA',
    dialCode: '+974',
    flag: '🇶🇦',
    example: '3312 3456',
    digitsLength: 8,
    regex: /^(?:33|55|66|77|30|31|50|51|60|61|70|71)\d{6}$/,
    description: 'Qatar Mobile (8 digits)'
  },
  {
    country: 'Oman',
    code: 'OM',
    dialCode: '+968',
    flag: '🇴🇲',
    example: '9123 4567',
    digitsLength: 8,
    regex: /^(?:7|9)\d{7}$/,
    description: 'Oman Mobile (8 digits, starts with 7 or 9)'
  },
  {
    country: 'Kuwait',
    code: 'KW',
    dialCode: '+965',
    flag: '🇰🇼',
    example: '5123 4567',
    digitsLength: 8,
    regex: /^(?:5|6|9)\d{7}$/,
    description: 'Kuwait Mobile (8 digits, starts with 5, 6, 9)'
  },
  {
    country: 'Bahrain',
    code: 'BH',
    dialCode: '+973',
    flag: '🇧🇭',
    example: '3912 3456',
    digitsLength: 8,
    regex: /^(?:3|6)\d{7}$/,
    description: 'Bahrain Mobile (8 digits, starts with 3 or 6)'
  },
  {
    country: 'United Kingdom',
    code: 'GB',
    dialCode: '+44',
    flag: '🇬🇧',
    example: '7911 123456',
    digitsLength: 10,
    regex: /^7\d{9}$/,
    description: 'UK Mobile (10 digits after +44, starts with 7)'
  },
  {
    country: 'United States',
    code: 'US',
    dialCode: '+1',
    flag: '🇺🇸',
    example: '212 555 0199',
    digitsLength: 10,
    regex: /^[2-9]\d{2}[2-9]\d{6}$/,
    description: 'US / Canada (10 digits)'
  }
];

/**
 * Strips non-digit characters from a phone string
 */
export const cleanDigits = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
};

/**
 * Detects user country based on browser timezone and language, defaulting to UAE HQ
 */
export const detectUserCountry = () => {
  try {
    const tz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) {
      return '+91';
    }
    if (tz.includes('Dubai') || tz.includes('Muscat') || tz.includes('Abu_Dhabi')) {
      return '+971';
    }
    if (tz.includes('Riyadh')) return '+966';
    if (tz.includes('Qatar') || tz.includes('Doha')) return '+974';
    if (tz.includes('Kuwait')) return '+965';
    if (tz.includes('Bahrain')) return '+973';
    if (tz.includes('London')) return '+44';
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) return '+1';

    if (typeof navigator !== 'undefined') {
      const lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (lang.endsWith('-in') || lang.startsWith('ta') || lang.startsWith('hi')) return '+91';
      if (lang.endsWith('-ae')) return '+971';
      if (lang.endsWith('-sa')) return '+966';
      if (lang.endsWith('-gb')) return '+44';
      if (lang.endsWith('-us')) return '+1';
    }
  } catch (e) {
    // fallback
  }
  return '+971';
};

/**
 * Detects country based on phone string or returns default
 */
export const detectCountryByPhone = (phoneString, defaultCode = 'AE') => {
  if (!phoneString) {
    return SUPPORTED_COUNTRY_CODES.find(c => c.code === defaultCode) || SUPPORTED_COUNTRY_CODES[0];
  }

  const str = String(phoneString).trim();
  for (const c of SUPPORTED_COUNTRY_CODES) {
    if (str.startsWith(c.dialCode)) {
      return c;
    }
  }

  return SUPPORTED_COUNTRY_CODES.find(c => c.code === defaultCode) || SUPPORTED_COUNTRY_CODES[0];
};

/**
 * Validates a national phone number against a selected country definition
 */
export const validatePhoneNumber = (rawNumber, countryDialCode = '+971') => {
  if (!rawNumber) {
    return {
      isValid: false,
      error: 'Phone number is required.',
      formatted: ''
    };
  }

  const country = SUPPORTED_COUNTRY_CODES.find(c => c.dialCode === countryDialCode) || SUPPORTED_COUNTRY_CODES[0];
  
  // Clean off dialCode if prepended in raw string
  let nationalDigits = cleanDigits(rawNumber);
  const dialCodeDigits = cleanDigits(country.dialCode);
  
  if (nationalDigits.startsWith(dialCodeDigits)) {
    nationalDigits = nationalDigits.slice(dialCodeDigits.length);
  }

  // Strip leading 0 if present (e.g., 050 -> 50 in UAE, 07 -> 7 in UK)
  if (nationalDigits.startsWith('0') && nationalDigits.length === country.digitsLength + 1) {
    nationalDigits = nationalDigits.slice(1);
  }

  if (nationalDigits.length === 0) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number.',
      formatted: ''
    };
  }

  if (nationalDigits.length !== country.digitsLength) {
    return {
      isValid: false,
      error: `${country.country} numbers must be exactly ${country.digitsLength} digits (e.g. ${country.example}).`,
      formatted: `${country.dialCode} ${nationalDigits}`
    };
  }

  if (!country.regex.test(nationalDigits)) {
    return {
      isValid: false,
      error: `Invalid ${country.country} phone format. Expected: ${country.description}.`,
      formatted: `${country.dialCode} ${nationalDigits}`
    };
  }

  return {
    isValid: true,
    error: null,
    nationalDigits,
    formatted: `${country.dialCode} ${nationalDigits}`,
    e164: `${country.dialCode}${nationalDigits}`,
    country
  };
};


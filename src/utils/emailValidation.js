/**
 * Enterprise Email Validation Utility (Bug #12 & Candidate Integrity)
 * Validates candidate emails against:
 * - RFC 5322 compliance
 * - Strict length (6 to 80 chars)
 * - Anti-spam / anti-dummy checks (repetitive characters, keyboard mash)
 * - Extensive disposable / temporary email provider blacklist
 * - Legitimate TLD checking
 */

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'test.com', 'example.com', 'fake.com', 'temp.com', 'mailinator.com', 'demo.com', 'asdf.com', 'sample.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.net',
  '10minutemail.com', '10minutemail.net', 'trashmail.com', 'trashmail.net', 'sharklasers.com', 'dispostable.com',
  'throwawaymail.com', 'getairmail.com', 'inboxkitten.com', 'fakeinbox.com', 'maildrop.cc', 'mohmal.com',
  'crazymailing.com', 'nada.ltd', 'dropmail.me', 'fakemail.net', 'emailfake.com', 'generator.email', 'mytemp.email',
  'armyspy.com', 'cuvox.de', 'dayrep.com', 'fleckens.hu', 'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com',
  'teleworm.us', 'tinypm.com', 'throwaway.email', 'burnermail.io', 'mailcatch.com', 'getnada.com', 'emailondeck.com',
  'trashmail.me', 'disposable.com', 'throwaway.com', 'tempinbox.com', 'trashmail.org', 'maildrop.net'
]);

const DUMMY_LOCAL_PARTS = new Set([
  'asdf', 'qwerty', 'test', 'testing', 'fake', 'dummy', 'sample', 'temp', 'admin', 'user',
  'nobody', 'noreply', 'no-reply', '12345', '123456', 'abcdef', 'foo', 'bar', 'testuser',
  'candidate', 'xyz', 'aaaa', 'bbbb', 'cccc'
]);

const DUMMY_DOMAIN_NAMES = new Set([
  'asdf', 'qwerty', 'test', 'fake', 'dummy', 'temp', 'demo', 'sample', 'example',
  'xyz', 'abc', '123', 'foo', 'bar', 'mailinator', 'yopmail'
]);

export const validateCandidateEmail = (emailStr) => {
  if (!emailStr || typeof emailStr !== 'string') {
    return { isValid: false, message: 'Email address is required.' };
  }

  const clean = emailStr.trim().toLowerCase();

  if (clean.length < 6 || clean.length > 80) {
    return { isValid: false, message: 'Email address must be between 6 and 80 characters.' };
  }

  if (clean.includes('..') || clean.includes('@@') || clean.includes(' ')) {
    return { isValid: false, message: 'Email contains consecutive special characters or spaces.' };
  }

  const emailRegex = /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,10}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, message: 'Please enter a valid email format (e.g. name@domain.com).' };
  }

  const atParts = clean.split('@');
  if (atParts.length !== 2) {
    return { isValid: false, message: 'Invalid email address structure.' };
  }

  const [localPart, domainPart] = atParts;
  if (!localPart || !domainPart || localPart.length < 3 || localPart.length > 64) {
    return { isValid: false, message: 'Email username must be between 3 and 64 characters.' };
  }

  // Reject repetitive keystrokes like aaaaa@, 11111@
  if (/^(.)\1{3,}$/.test(localPart)) {
    return { isValid: false, message: 'Repetitive dummy email addresses are not permitted.' };
  }

  if (DUMMY_LOCAL_PARTS.has(localPart)) {
    return { isValid: false, message: 'Generic or placeholder email usernames are not permitted.' };
  }

  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return { isValid: false, message: 'Invalid email domain structure.' };
  }

  const domainName = domainParts[0];
  const tld = domainParts[domainParts.length - 1];

  if (domainName.length < 2 || /^(.)\1{2,}$/.test(domainName) || DUMMY_DOMAIN_NAMES.has(domainName)) {
    return { isValid: false, message: 'Invalid or dummy email domain name.' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domainPart)) {
    return { isValid: false, message: 'Temporary and disposable email addresses are not accepted for registration.' };
  }

  if (!/^[a-zA-Z]{2,10}$/.test(tld)) {
    return { isValid: false, message: 'Email domain extension (TLD) must be valid.' };
  }

  return { isValid: true, email: clean };
};

export const isValidEmail = (emailStr) => {
  return validateCandidateEmail(emailStr).isValid;
};

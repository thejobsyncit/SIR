/**
 * Deterministic Executive Headshot & Profile Avatar Utility
 * Provides verified executive portraits for candidates without custom uploaded/Google avatars,
 * ensuring high-quality, professional presentation across CRM Candidates, Job Applications,
 * and HR Ops directories without empty initials or missing images.
 */

export const EXECUTIVE_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=200&auto=format&fit=crop&q=80'
];

/**
 * Fallback branded SVG generator with candidate initials on gold/navy background
 */
export const getCandidateFallbackAvatar = (c) => {
  const name = typeof c === 'string' ? c : (c?.name || c?.fullName || c?.applicantName || 'Candidate');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=f59e0b&bold=true&size=128`;
};

/**
 * Resolves the candidate avatar URL:
 * 1. Returns authentic uploaded photo or Google avatar if present
 * 2. Checks browser localStorage candidate stores as immediate real-time fallback
 * 3. Falls back deterministically to a verified executive portrait based on email/ID/name
 */
export const getCandidateAvatar = (c) => {
  if (!c) return EXECUTIVE_AVATARS[0];

  let rawAvatar = c?.avatar || (typeof c?.photo === 'string' ? c.photo : null) || (typeof c?.candidateAvatar === 'string' ? c.candidateAvatar : null);

  // If phone or currentRole contains a stray URL
  if (!rawAvatar && typeof c?.phone === 'string' && c.phone.startsWith('http')) {
    rawAvatar = c.phone;
  }
  if (!rawAvatar && typeof c?.currentRole === 'string' && c.currentRole.startsWith('http')) {
    rawAvatar = c.currentRole;
  }

  // Check client localStorage candidate stores as real-time fallback
  const email = (c?.email || c?.applicantEmail || '').toLowerCase().trim();
  if (!rawAvatar && typeof window !== 'undefined' && window.localStorage && email) {
    try {
      const dbStr = localStorage.getItem('sir_candidates_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const local = db[email];
        if (local?.avatar) rawAvatar = local.avatar;
      }
    } catch (_) {}

    if (!rawAvatar) {
      try {
        const sessStr = localStorage.getItem('sir_user_session');
        if (sessStr) {
          const sess = JSON.parse(sessStr);
          if (sess?.avatar && (sess?.email?.toLowerCase().trim() === email || sess?.candidateId === c.id)) {
            rawAvatar = sess.avatar;
          }
        }
      } catch (_) {}
    }
  }

  // If candidate has an uploaded custom image or Google avatar
  if (
    typeof rawAvatar === 'string' &&
    (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('data:image')) &&
    rawAvatar !== '[]' &&
    rawAvatar.length > 10
  ) {
    return rawAvatar;
  }

  // Deterministic executive portrait assignment based on candidate unique seed
  const seed = String(email || c?.id || c?.candidateId || c?.name || c?.fullName || c?.applicantName || 'Candidate').toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % EXECUTIVE_AVATARS.length;
  return EXECUTIVE_AVATARS[index];
};

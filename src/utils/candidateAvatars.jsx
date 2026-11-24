import React, { useState } from 'react';

/**
 * Resolves the genuine candidate profile photo from candidate records or dashboard stores.
 * Never assigns foreign stock photos or mock avatars.
 * Returns null if the candidate has not uploaded a photo in their dashboard or authenticated with Google.
 */
export const getCandidatePhoto = (c) => {
  if (!c) return null;

  let rawAvatar = c?.avatar || (typeof c?.photo === 'string' ? c.photo : null) || (typeof c?.candidateAvatar === 'string' ? c.candidateAvatar : null);

  // Filter out stray non-avatar tokens
  if (typeof rawAvatar === 'string' && (rawAvatar.includes('dicebear') || rawAvatar.includes('unsplash.com') || rawAvatar === '[]' || rawAvatar.length < 10)) {
    rawAvatar = null;
  }

  // Check client localStorage candidate stores as immediate real-time fallback
  const email = (c?.email || c?.applicantEmail || '').toLowerCase().trim();
  if (!rawAvatar && typeof window !== 'undefined' && window.localStorage && email) {
    try {
      const dbStr = localStorage.getItem('sir_candidates_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const local = db[email];
        if (local?.avatar && typeof local.avatar === 'string' && !local.avatar.includes('dicebear') && !local.avatar.includes('unsplash.com') && local.avatar.length > 10) {
          rawAvatar = local.avatar;
        }
      }
    } catch (_) {}

    if (!rawAvatar) {
      try {
        const sessStr = localStorage.getItem('sir_user_session');
        if (sessStr) {
          const sess = JSON.parse(sessStr);
          if (sess?.avatar && (sess?.email?.toLowerCase().trim() === email || sess?.candidateId === c.id)) {
            if (typeof sess.avatar === 'string' && !sess.avatar.includes('dicebear') && !sess.avatar.includes('unsplash.com') && sess.avatar.length > 10) {
              rawAvatar = sess.avatar;
            }
          }
        }
      } catch (_) {}
    }

    if (!rawAvatar) {
      try {
        const crmStr = localStorage.getItem('crm_candidates');
        if (crmStr) {
          const list = JSON.parse(crmStr);
          if (Array.isArray(list)) {
            const found = list.find(x => (x.email && x.email.toLowerCase().trim() === email) || (x.id && x.id === c.id));
            if (found?.avatar && typeof found.avatar === 'string' && !found.avatar.includes('dicebear') && !found.avatar.includes('unsplash.com') && found.avatar.length > 10) {
              rawAvatar = found.avatar;
            }
          }
        }
      } catch (_) {}
    }
  }

  // If candidate has an authentic uploaded custom image or Google profile photo
  if (
    typeof rawAvatar === 'string' &&
    (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('data:image')) &&
    !rawAvatar.includes('unsplash.com') &&
    !rawAvatar.includes('dicebear') &&
    rawAvatar !== '[]' &&
    rawAvatar.length > 10
  ) {
    return rawAvatar;
  }

  return null;
};

/**
 * Candidate initial letter exactly as rendered in CandidatePortal dashboard
 */
export const getCandidateInitial = (c) => {
  const name = typeof c === 'string' ? c : (c?.name || c?.fullName || c?.applicantName || 'Candidate');
  return name.trim().charAt(0).toUpperCase() || 'C';
};

/**
 * 1:1 Unified Candidate Avatar Component matching CandidatePortal (Dashboard)
 * - Renders genuine uploaded / Google photo if present
 * - Renders dashboard amber/gold gradient initial box if no photo is uploaded
 */
export const DashboardCandidateAvatar = ({ candidate, name, avatar, sizeClasses = "w-11 h-11 text-base", className = "" }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const candObj = candidate || { name, avatar };
  const photo = getCandidatePhoto(candObj);
  const initial = getCandidateInitial(candObj);

  if (photo && !imgFailed) {
    return (
      <img
        src={photo}
        alt={candObj?.name || 'Candidate'}
        onError={() => setImgFailed(true)}
        className={`${sizeClasses} rounded-2xl object-cover border-2 border-amber-500/80 dark:border-gold-500 shadow-md shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-gold-600 text-slate-950 font-serif font-black flex items-center justify-center border-2 border-amber-500 dark:border-gold-500/90 shadow-md shrink-0 select-none ${className}`}
    >
      {initial}
    </div>
  );
};

// Aliases for backwards compatibility with previous imports
export const getCandidateAvatar = (c) => getCandidatePhoto(c);
export const getCandidateFallbackAvatar = (c) => getCandidateInitial(c);

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

function sanitizeSupabaseUrl(url) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return String(url).replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
}

export function getSupabaseClient() {
  const rawUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }
  return null;
}

export const supabase = getSupabaseClient();

/**
 * Fetch candidates from Supabase
 */
export async function fetchSupabaseCandidates() {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const [{ data: cands, error: errC }, { data: users, error: errU }] = await Promise.all([
      client.from('candidates').select('*').order('createdat', { ascending: false }).limit(200),
      client.from('users').select('id, email, phone, avatar, createdat').eq('role', 'candidate').limit(200)
    ]);

    if (errC) {
      console.warn('[Supabase] fetch candidates warning:', errC.message);
      return [];
    }

    const userAvatarMap = new Map();
    const userCreatedMap = new Map();
    if (Array.isArray(users)) {
      for (const u of users) {
        const uEmail = (u.email || '').toLowerCase().trim();
        if (uEmail && u.avatar) userAvatarMap.set(uEmail, u.avatar);
        if (u.id && u.avatar) userAvatarMap.set(u.id, u.avatar);
        const uCreated = u.createdat || u.createdAt || null;
        if (uEmail && uCreated) userCreatedMap.set(uEmail, uCreated);
        if (u.id && uCreated) userCreatedMap.set(u.id, uCreated);
      }
    }

    // Deduplicate candidates by lowercase email: STRICTLY 1 Profile per Email Address
    const seenEmails = new Set();
    const uniqueCands = [];
    for (const c of (cands || [])) {
      const emailKey = (c.email || '').toLowerCase().trim();
      if (emailKey) {
        if (seenEmails.has(emailKey)) continue;
        seenEmails.add(emailKey);
      }
      uniqueCands.push(c);
    }

    // Normalize lowercase PostgreSQL column names to camelCase for frontend & CRM consistency
    return uniqueCands.map(c => {
      let parsedSkills = [];
      try {
        if (typeof c.skills === 'string') {
          parsedSkills = JSON.parse(c.skills);
        } else if (Array.isArray(c.skills)) {
          parsedSkills = c.skills;
        }
      } catch {
        parsedSkills = c.skills ? [c.skills] : [];
      }

      const emailKey = (c.email || '').toLowerCase().trim();
      const resolvedAvatar = userAvatarMap.get(emailKey) || (c.id ? userAvatarMap.get(c.id) : null);
      const userCreated = userCreatedMap.get(emailKey) || (c.id ? userCreatedMap.get(c.id) : null);
      const candCreated = c.createdat || c.createdAt || null;
      const earliestCreated = pickEarlierIso(userCreated, candCreated) || candCreated || userCreated;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        avatar: resolvedAvatar || null,
        nationality: c.nationality || 'UAE',
        currentEmployer: c.currentemployer || c.currentEmployer || 'Revival International Talent Pool',
        currentRole: c.currentrole || c.currentRole || 'Executive Candidate',
        currentSalary: c.currentsalary || c.currentSalary || '',
        expectedSalary: c.expectedsalary || c.expectedSalary || 'Market Standard',
        score: Number(c.score) || 90,
        stage: c.stage || 'lead',
        skills: parsedSkills,
        source: c.source || 'Website Candidate Registration',
        passport: c.passport || 'Verified',
        aiSummary: c.aisummary || c.aiSummary || `Registered Candidate (${c.email || c.name}) with international credentials.`,
        experience: c.experience || '3-5 Years',
        createdAt: earliestCreated,
        registeredAt: earliestCreated
      };
    });
  } catch (err) {
    console.warn('[Supabase] fetch candidates exception:', err.message);
    return [];
  }
}

function pickEarlierIso(...values) {
  let bestIso = null;
  let bestMs = Infinity;
  for (const val of values) {
    if (!val) continue;
    const str = String(val).trim();
    const normalized = str.includes('T') ? str : str.replace(' ', 'T') + (str.endsWith('Z') ? '' : 'Z');
    const ms = Date.parse(normalized);
    if (!Number.isNaN(ms) && ms > 0 && ms < bestMs) {
      bestMs = ms;
      bestIso = str;
    }
  }
  return bestIso;
}

function normalizeCandidateRow(r) {
  if (!r || typeof r !== 'object') return r;
  return {
    ...r,
    userId: r.userid || r.userId || null,
    passwordHash: r.passwordhash || r.passwordHash || null,
    passwordSalt: r.passwordsalt || r.passwordSalt || null,
    normalizedPhone: r.normalizedphone || r.normalizedPhone || null,
    authProvider: r.authprovider || r.authProvider || null,
    googleSub: r.googlesub || r.googleSub || null,
    googleId: r.googleid || r.googleId || r.googlesub || null,
    emailVerified: r.emailverified !== undefined ? r.emailverified : r.emailVerified,
    lastLoginAt: r.lastloginat || r.lastLoginAt || null,
    currentEmployer: r.currentemployer || r.currentEmployer || null,
    currentRole: r.currentrole || r.currentRole || null,
    currentSalary: r.currentsalary || r.currentSalary || null,
    expectedSalary: r.expectedsalary || r.expectedSalary || null,
    noticePeriod: r.noticeperiod || r.noticePeriod || null,
    preferredCountry: r.preferredcountry || r.preferredCountry || null,
    resumeName: r.resumename || r.resumeName || null,
    resumeUrl: r.resumeurl || r.resumeUrl || null,
    resumeSize: r.resumesize || r.resumeSize || null,
    savedJobs: r.savedjobs || r.savedJobs || null,
    profileCompletion: r.profilecompletion !== undefined ? r.profilecompletion : r.profileCompletion,
    createdAt: r.createdat || r.createdAt || null,
    updatedAt: r.updatedat || r.updatedAt || null
  };
}

/**
 * Look up an existing candidate account authoritatively across users, candidate_profiles, and candidates in Supabase
 */
export async function findSupabaseCandidateAuth(email) {
  const client = getSupabaseClient();
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!client || !cleanEmail) return { exists: false, user: null, profile: null, candidate: null, earliestCreatedAt: null };
  try {
    const [{ data: users }, { data: profiles }, { data: cands }] = await Promise.all([
      client.from('users').select('*').ilike('email', cleanEmail).limit(5),
      client.from('candidate_profiles').select('*').ilike('email', cleanEmail).limit(5),
      client.from('candidates').select('*').ilike('email', cleanEmail).limit(5)
    ]);

    const userRowRaw = (users || []).find(u => (u.role || 'candidate').toLowerCase() === 'candidate') || (users || [])[0] || null;
    const profileRowRaw = (profiles || [])[0] || null;
    const candRowRaw = (cands || [])[0] || null;

    const user = normalizeCandidateRow(userRowRaw);
    const profile = normalizeCandidateRow(profileRowRaw);
    const candidate = normalizeCandidateRow(candRowRaw);

    const isCandidateAccount = Boolean(
      (user && (user.role || 'candidate').toLowerCase() === 'candidate') ||
      profile ||
      candidate
    );

    const earliestCreatedAt = pickEarlierIso(
      user?.createdAt,
      candidate?.createdAt,
      profile?.createdAt
    );

    return {
      exists: isCandidateAccount || Boolean(user),
      isCandidateAccount,
      user,
      profile,
      candidate,
      earliestCreatedAt
    };
  } catch (err) {
    console.warn('[Supabase] findCandidateAuth warning:', err.message);
    return { exists: false, isCandidateAccount: false, user: null, profile: null, candidate: null, earliestCreatedAt: null };
  }
}

/**
 * Upsert candidate profile into Supabase (never overwrites original registration createdat)
 */
export async function syncCandidateToSupabase(cand) {
  const client = getSupabaseClient();
  if (!client || !cand) return null;
  try {
    const cleanEmail = (cand.email || '').toLowerCase().trim();
    const candidateRow = {
      id: cand.id,
      name: cand.name,
      email: cleanEmail,
      phone: cand.phone || '',
      nationality: cand.nationality || 'UAE',
      score: Number(cand.score) || 90,
      stage: cand.stage || 'lead',
      skills: typeof cand.skills === 'string' ? cand.skills : JSON.stringify(cand.skills || []),
      source: cand.source || 'Website Candidate Registration',
      passport: cand.passport || 'Verified',
      experience: cand.experience || '3-5 Years'
    };

    let existingCreatedAt = null;
    // STRICT 1 CANDIDATE PER EMAIL: If this email already exists in Supabase, reuse existing ID & preserve original createdat
    if (cleanEmail) {
      const { data: existingCand } = await client
        .from('candidates')
        .select('id, createdat')
        .ilike('email', cleanEmail)
        .limit(1);
      if (existingCand && existingCand.length > 0) {
        if (existingCand[0].id) candidateRow.id = existingCand[0].id;
        existingCreatedAt = existingCand[0].createdat || null;
      }
    }
    if (!existingCreatedAt && candidateRow.id) {
      const { data: existingById } = await client
        .from('candidates')
        .select('id, createdat')
        .eq('id', candidateRow.id)
        .limit(1);
      if (existingById && existingById.length > 0 && existingById[0].createdat) {
        existingCreatedAt = existingById[0].createdat;
      }
    }

    const preservedCreated = pickEarlierIso(existingCreatedAt, cand.createdAt || cand.createdat);
    if (preservedCreated) {
      candidateRow.createdat = preservedCreated;
    }

    const { data, error } = await client
      .from('candidates')
      .upsert([candidateRow], { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] upsert candidate warning:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] syncCandidate exception:', err.message);
    return null;
  }
}

/**
 * Sync registered user account into Supabase (preserves original createdat)
 */
export async function syncUserToSupabase(user) {
  const client = getSupabaseClient();
  if (!client || !user) return null;
  try {
    const cleanEmail = (user.email || '').toLowerCase().trim();
    const userRow = {
      id: user.id,
      name: user.name,
      email: cleanEmail,
      phone: user.phone || '',
      role: user.role || 'candidate',
      status: user.status || 'active',
      avatar: user.avatar !== undefined ? user.avatar : null
    };
    if (user.passwordHash) userRow.passwordhash = user.passwordHash;
    if (user.passwordSalt) userRow.passwordsalt = user.passwordSalt;
    if (user.normalizedPhone) userRow.normalizedphone = user.normalizedPhone;
    if (user.authProvider) userRow.authprovider = user.authProvider;
    if (user.googleSub) userRow.googlesub = user.googleSub;
    if (user.emailVerified !== undefined) userRow.emailverified = user.emailVerified;
    if (user.lastLoginAt) userRow.lastloginat = user.lastLoginAt;

    let existingCreatedAt = null;
    if (cleanEmail) {
      const { data: existingByEmail } = await client
        .from('users')
        .select('id, createdat')
        .ilike('email', cleanEmail)
        .limit(1);
      if (existingByEmail && existingByEmail.length > 0) {
        if (existingByEmail[0].id) userRow.id = existingByEmail[0].id;
        existingCreatedAt = existingByEmail[0].createdat || null;
      }
    }
    if (!existingCreatedAt && userRow.id) {
      const { data: existingById } = await client
        .from('users')
        .select('id, createdat')
        .eq('id', userRow.id)
        .limit(1);
      if (existingById && existingById.length > 0) {
        existingCreatedAt = existingById[0].createdat || null;
      }
    }

    const preservedCreated = pickEarlierIso(existingCreatedAt, user.createdAt || user.createdat);
    if (preservedCreated) {
      userRow.createdat = preservedCreated;
    }

    const { data, error } = await client
      .from('users')
      .upsert([userRow], { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] upsert user warning:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] syncUser exception:', err.message);
    return null;
  }
}

/**
 * Check if candidate email or phone exists in Supabase PostgreSQL across users, candidate_profiles, and candidates
 */
export async function checkSupabaseCandidateExists(email, phone = '') {
  const client = getSupabaseClient();
  if (!client) return { exists: false };
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (cleanEmail) {
      const [{ data: usersByEmail }, { data: profilesByEmail }, { data: candsByEmail }] = await Promise.all([
        client.from('users').select('id, email').ilike('email', cleanEmail).limit(1),
        client.from('candidate_profiles').select('id, email').ilike('email', cleanEmail).limit(1),
        client.from('candidates').select('id, email').ilike('email', cleanEmail).limit(1)
      ]);
      if (usersByEmail && usersByEmail.length > 0) return { exists: true, field: 'email', user: usersByEmail[0] };
      if (profilesByEmail && profilesByEmail.length > 0) return { exists: true, field: 'email', profile: profilesByEmail[0] };
      if (candsByEmail && candsByEmail.length > 0) return { exists: true, field: 'email', candidate: candsByEmail[0] };
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length >= 7) {
      const phoneSuffix = cleanPhone.slice(-7);
      const [{ data: usersByPhone }, { data: profilesByPhone }, { data: candsByPhone }] = await Promise.all([
        client.from('users').select('id, phone').like('phone', `%${phoneSuffix}`).limit(1),
        client.from('candidate_profiles').select('id, phone').like('phone', `%${phoneSuffix}`).limit(1),
        client.from('candidates').select('id, phone').like('phone', `%${phoneSuffix}`).limit(1)
      ]);
      if (usersByPhone && usersByPhone.length > 0) return { exists: true, field: 'phone', user: usersByPhone[0] };
      if (profilesByPhone && profilesByPhone.length > 0) return { exists: true, field: 'phone', profile: profilesByPhone[0] };
      if (candsByPhone && candsByPhone.length > 0) return { exists: true, field: 'phone', candidate: candsByPhone[0] };
    }

    return { exists: false };
  } catch (err) {
    console.warn('[Supabase] checkCandidateExists warning:', err.message);
    return { exists: false };
  }
}

/**
 * Permanently delete candidate from Supabase across candidates, candidate_profiles, users, and google_auth_accounts
 */
export async function deleteCandidateFromSupabase(candidateId, email = '', phone = '') {
  const client = getSupabaseClient();
  if (!client) return { success: true };
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const phoneSuffix = cleanPhone.length >= 7 ? cleanPhone.slice(-7) : '';

    // Delete from candidates, candidate_profiles, and users
    for (const table of ['candidates', 'candidate_profiles', 'users']) {
      if (candidateId) {
        await client.from(table).delete().eq('id', candidateId);
      }
      if (cleanEmail) {
        await client.from(table).delete().ilike('email', cleanEmail);
      }
      if (phoneSuffix) {
        await client.from(table).delete().like('phone', `%${phoneSuffix}`);
      }
    }

    if (cleanEmail) {
      await client.from('google_auth_accounts').delete().ilike('email', cleanEmail);
    }

    // Note: candidate_applications are intentionally preserved in Supabase for audit and recruitment pipeline tracking

    return { success: true };
  } catch (err) {
    console.warn('[Supabase] deleteCandidate exception:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all candidate applications from Supabase Cloud
 */
export async function fetchSupabaseApplications() {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const [{ data: apps, error: errA }, { data: cands, error: errC }] = await Promise.all([
      client.from('candidate_applications').select('*').order('applieddate', { ascending: false }).limit(300),
      client.from('candidates').select('id, name, email, phone, nationality, experience').limit(300)
    ]);

    if (errA) {
      console.warn('[Supabase] fetch applications warning:', errA.message);
      return [];
    }

    const candMap = new Map();
    if (Array.isArray(cands)) {
      cands.forEach(c => {
        if (c.id) candMap.set(c.id, c);
        if (c.email) candMap.set(c.email.toLowerCase().trim(), c);
      });
    }

    return (apps || []).map(a => {
      const emailKey = (a.applicantemail || '').toLowerCase().trim();
      const cand = (a.candidateid ? candMap.get(a.candidateid) : null) || (emailKey ? candMap.get(emailKey) : null);

      return {
        id: a.id,
        candidateId: a.candidateid || cand?.id || null,
        userId: a.userid || null,
        jobId: a.jobid,
        jobTitle: a.jobtitle || 'Job Opening',
        company: a.company || 'Revival International',
        location: a.location || 'UAE',
        appliedDate: a.applieddate || a.createdat,
        status: a.status || 'Under Review',
        stage: 'Applied',
        applicantName: a.applicantname || cand?.name || 'Candidate',
        applicantEmail: a.applicantemail || cand?.email || '',
        applicantPhone: a.applicantphone || cand?.phone || '',
        candidateNationality: cand?.nationality || 'UAE',
        candidateExperience: cand?.experience || '3-5 Years',
        createdAt: a.createdat || a.applieddate
      };
    });
  } catch (err) {
    console.warn('[Supabase] fetch applications exception:', err.message);
    return [];
  }
}

/**
 * Upsert candidate application into Supabase Cloud
 */
export async function syncApplicationToSupabase(app) {
  const client = getSupabaseClient();
  if (!client || !app) return null;
  try {
    const row = {
      id: app.id,
      candidateid: app.candidateId || null,
      userid: app.userId || null,
      jobid: String(app.jobId),
      jobtitle: app.jobTitle || 'Job Opening',
      company: app.company || 'Revival International',
      location: app.location || 'UAE',
      applieddate: app.appliedDate || app.createdAt || new Date().toISOString(),
      status: app.status || 'Under Review'
    };

    const { data, error } = await client
      .from('candidate_applications')
      .upsert([row], { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase] sync application warning:', error.message);
    }
    return data;
  } catch (err) {
    console.warn('[Supabase] sync application exception:', err.message);
    return null;
  }
}

/**
 * Delete candidate application from Supabase Cloud
 */
export async function deleteApplicationFromSupabase(appId) {
  const client = getSupabaseClient();
  if (!client || !appId) return { success: true };
  try {
    await client.from('candidate_applications').delete().eq('id', appId);
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] delete application warning:', err.message);
    return { success: false };
  }
}

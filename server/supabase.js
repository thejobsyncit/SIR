import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
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
    if (Array.isArray(users)) {
      for (const u of users) {
        if (u.email && u.avatar) userAvatarMap.set(u.email.toLowerCase().trim(), u.avatar);
        if (u.id && u.avatar) userAvatarMap.set(u.id, u.avatar);
      }
    }

    // Normalize lowercase PostgreSQL column names to camelCase for frontend & CRM consistency
    return (cands || []).map(c => {
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
        createdAt: c.createdat || c.createdAt || null,
        registeredAt: c.createdat || c.createdAt || null
      };
    });
  } catch (err) {
    console.warn('[Supabase] fetch candidates exception:', err.message);
    return [];
  }
}

/**
 * Upsert candidate profile into Supabase
 */
export async function syncCandidateToSupabase(cand) {
  const client = getSupabaseClient();
  if (!client || !cand) return null;
  try {
    const candidateRow = {
      id: cand.id,
      name: cand.name,
      email: (cand.email || '').toLowerCase().trim(),
      phone: cand.phone || '',
      nationality: cand.nationality || 'UAE',
      score: Number(cand.score) || 90,
      stage: cand.stage || 'lead',
      skills: typeof cand.skills === 'string' ? cand.skills : JSON.stringify(cand.skills || []),
      source: cand.source || 'Website Candidate Registration',
      passport: cand.passport || 'Verified',
      experience: cand.experience || '3-5 Years'
    };
    if (cand.createdAt || cand.createdat) {
      candidateRow.createdat = cand.createdAt || cand.createdat;
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
 * Sync registered user account into Supabase
 */
export async function syncUserToSupabase(user) {
  const client = getSupabaseClient();
  if (!client || !user) return null;
  try {
    const userRow = {
      id: user.id,
      name: user.name,
      email: (user.email || '').toLowerCase().trim(),
      phone: user.phone || '',
      role: user.role || 'candidate',
      status: user.status || 'active',
      avatar: user.avatar !== undefined ? user.avatar : null
    };
    if (user.createdAt || user.createdat) {
      userRow.createdat = user.createdAt || user.createdat;
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
 * Check if candidate email or phone exists in Supabase PostgreSQL
 */
export async function checkSupabaseCandidateExists(email, phone = '') {
  const client = getSupabaseClient();
  if (!client) return { exists: false };
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (cleanEmail) {
      const { data: usersByEmail } = await client.from('users').select('id, email').ilike('email', cleanEmail).limit(1);
      if (usersByEmail && usersByEmail.length > 0) return { exists: true, field: 'email', user: usersByEmail[0] };

      const { data: candsByEmail } = await client.from('candidates').select('id, email').ilike('email', cleanEmail).limit(1);
      if (candsByEmail && candsByEmail.length > 0) return { exists: true, field: 'email', candidate: candsByEmail[0] };
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length >= 7) {
      const phoneSuffix = cleanPhone.slice(-7);
      const { data: usersByPhone } = await client.from('users').select('id, phone').like('phone', `%${phoneSuffix}`).limit(1);
      if (usersByPhone && usersByPhone.length > 0) return { exists: true, field: 'phone', user: usersByPhone[0] };

      const { data: candsByPhone } = await client.from('candidates').select('id, phone').like('phone', `%${phoneSuffix}`).limit(1);
      if (candsByPhone && candsByPhone.length > 0) return { exists: true, field: 'phone', candidate: candsByPhone[0] };
    }

    return { exists: false };
  } catch (err) {
    console.warn('[Supabase] checkCandidateExists warning:', err.message);
    return { exists: false };
  }
}

/**
 * Permanently delete candidate from Supabase
 */
export async function deleteCandidateFromSupabase(candidateId, email = '', phone = '') {
  const client = getSupabaseClient();
  if (!client) return { success: true };
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').replace(/\D/g, '');

    // 1. Delete from candidates table
    if (candidateId) {
      await client.from('candidates').delete().eq('id', candidateId);
    }
    if (cleanEmail) {
      await client.from('candidates').delete().ilike('email', cleanEmail);
    }
    if (cleanPhone && cleanPhone.length >= 7) {
      const phoneSuffix = cleanPhone.slice(-7);
      await client.from('candidates').delete().like('phone', `%${phoneSuffix}`);
    }

    // 2. Delete from users table if candidate
    if (candidateId) {
      await client.from('users').delete().eq('id', candidateId);
    }
    if (cleanEmail) {
      await client.from('users').delete().ilike('email', cleanEmail);
    }
    if (cleanPhone && cleanPhone.length >= 7) {
      const phoneSuffix = cleanPhone.slice(-7);
      await client.from('users').delete().like('phone', `%${phoneSuffix}`);
    }

    // 3. Delete from candidate_applications
    if (candidateId) {
      await client.from('candidate_applications').delete().eq('candidateId', candidateId);
    }
    if (cleanEmail) {
      await client.from('candidate_applications').delete().ilike('applicantEmail', cleanEmail);
    }

    return { success: true };
  } catch (err) {
    console.warn('[Supabase] deleteCandidate exception:', err.message);
    return { success: false, error: err.message };
  }
}

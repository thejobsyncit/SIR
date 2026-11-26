import { createClient } from '@supabase/supabase-js'

function sanitizeSupabaseUrl(url) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return String(url).replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = sanitizeSupabaseUrl(rawUrl)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err.message)
  }
}

if (!client) {
  // Provide safe fallback client so frontend runs smoothly without runtime crash
  client = {
    from: () => ({
      insert: async () => ({ data: null, error: null }),
      select: async () => ({ data: [], error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null })
    })
  }
}

export const supabase = client

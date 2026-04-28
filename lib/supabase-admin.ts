import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service_role key.
// ONLY use in API routes / server components — never expose to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase credentials – admin operations will fail gracefully')
}

// Use safe fallbacks so the module never throws at import time (e.g. during Next.js build).
// Requests made with placeholder credentials will return { data: null, error: ... } safely.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-service-role-key',
  { auth: { persistSession: false, autoRefreshToken: false } }
)

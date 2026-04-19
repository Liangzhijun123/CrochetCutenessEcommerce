import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service_role key.
// ONLY use in API routes / server components — never expose to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing SUPABASE_SERVICE_ROLE_KEY – XP writes will fail')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

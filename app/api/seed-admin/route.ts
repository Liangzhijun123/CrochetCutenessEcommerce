import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_EMAIL = 'admin@crochetcuteness.com'
const ADMIN_PASSWORD = 'Admin123!'
const ADMIN_NAME = 'Admin'

export async function POST(req: Request) {
  // Only allow seeding with the service role key as a simple guard
  const { secret } = await req.json().catch(() => ({ secret: '' }))
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if admin user already exists in the users table
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', ADMIN_EMAIL)
      .single()

    if (existing) {
      // Ensure role is admin
      await supabaseAdmin
        .from('users')
        .update({ role: 'admin' })
        .eq('id', existing.id)

      return NextResponse.json({
        message: 'Admin user already exists, role confirmed as admin',
        email: ADMIN_EMAIL,
      })
    }

    // Create auth user via admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // auto-confirm the email
    })

    if (authError) {
      // If user already exists in auth but not in users table
      if (authError.message?.includes('already been registered')) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const authUser = users.find(u => u.email === ADMIN_EMAIL)
        if (authUser) {
          await supabaseAdmin.from('users').upsert({
            id: authUser.id,
            email: ADMIN_EMAIL,
            full_name: ADMIN_NAME,
            role: 'admin',
            avatar_url: '',
          })
          return NextResponse.json({
            message: 'Admin profile created for existing auth user',
            email: ADMIN_EMAIL,
          })
        }
      }
      throw authError
    }

    // Create profile in users table
    const { error: profileError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email: ADMIN_EMAIL,
      full_name: ADMIN_NAME,
      role: 'admin',
      avatar_url: '',
    })

    if (profileError) throw profileError

    return NextResponse.json({
      message: 'Admin user created successfully',
      email: ADMIN_EMAIL,
    })
  } catch (error: any) {
    console.error('Seed admin error:', error)
    return NextResponse.json({ error: error.message || 'Failed to seed admin' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSupabaseUser } from '@/lib/supabase-auth-middleware'

// ─── helpers ───────────────────────────────────────────────

async function getAdminUserId(): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return data.id
}

async function enrichSessions(sessions: any[], currentUserId: string) {
  if (!sessions.length) return []

  const customerIds = [...new Set(sessions.map((s) => s.customer_id).filter(Boolean))]
  const adminIds = [...new Set(sessions.map((s) => s.admin_id).filter(Boolean))]
  const sellerIds = [...new Set(sessions.map((s) => s.seller_id).filter(Boolean))]
  const productIds = [...new Set(sessions.map((s) => s.product_id).filter(Boolean))]
  const sessionIds = sessions.map((s) => s.id)
  const allUserIds = [...new Set([...customerIds, ...adminIds])]

  const [usersResult, sellersResult, productsResult, allMsgsResult] = await Promise.all([
    allUserIds.length
      ? supabaseAdmin.from('users').select('id, full_name, avatar_url, role').in('id', allUserIds)
      : Promise.resolve({ data: [] }),
    sellerIds.length
      ? supabaseAdmin
          .from('sellers')
          .select('id, shop_name, user_id, users!user_id(full_name, avatar_url)')
          .in('id', sellerIds)
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabaseAdmin.from('products').select('id, title, image_url').in('id', productIds as string[])
      : Promise.resolve({ data: [] }),
    supabaseAdmin
      .from('chat_messages')
      .select('session_id, content, created_at, sender_id, is_read')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false }),
  ])

  const usersMap: Record<string, any> = {}
  for (const u of usersResult.data || []) usersMap[u.id] = u

  const sellersMap: Record<string, any> = {}
  for (const s of sellersResult.data || []) sellersMap[s.id] = s

  const productsMap: Record<string, any> = {}
  for (const p of productsResult.data || []) productsMap[p.id] = p

  const lastMsgMap: Record<string, any> = {}
  const unreadMap: Record<string, number> = {}
  for (const msg of allMsgsResult.data || []) {
    if (!lastMsgMap[msg.session_id]) lastMsgMap[msg.session_id] = msg
    if (!msg.is_read && msg.sender_id !== currentUserId) {
      unreadMap[msg.session_id] = (unreadMap[msg.session_id] || 0) + 1
    }
  }

  return sessions.map((session) => {
    const seller = sellersMap[session.seller_id]
    const customer = usersMap[session.customer_id]
    const admin = usersMap[session.admin_id]
    const product = productsMap[session.product_id]

    let otherParticipant: any = null
    if (session.session_type === 'seller_customer') {
      const isCustomer = session.customer_id === currentUserId
      if (isCustomer) {
        otherParticipant = seller
          ? { id: seller.user_id, name: seller.shop_name, avatar: (seller.users as any)?.avatar_url }
          : null
      } else {
        otherParticipant = customer
          ? { id: customer.id, name: customer.full_name, avatar: customer.avatar_url }
          : null
      }
    } else if (session.session_type === 'admin_customer') {
      if (session.customer_id === currentUserId) {
        otherParticipant = { id: session.admin_id || '', name: 'Admin Support', avatar: admin?.avatar_url || '' }
      } else {
        otherParticipant = customer ? { id: customer.id, name: customer.full_name, avatar: customer.avatar_url } : null
      }
    } else if (session.session_type === 'admin_seller') {
      if (seller?.user_id === currentUserId) {
        otherParticipant = { id: session.admin_id || '', name: 'Admin Support', avatar: admin?.avatar_url || '' }
      } else {
        otherParticipant = seller
          ? { id: seller.user_id, name: seller.shop_name, avatar: (seller.users as any)?.avatar_url }
          : null
      }
    }

    return {
      ...session,
      other_participant: otherParticipant,
      product: product || null,
      last_message: lastMsgMap[session.id] || null,
      unread_count: unreadMap[session.id] || 0,
    }
  })
}

// ─── GET /api/chat/sessions ─────────────────────────────────
export async function GET(request: NextRequest) {
  const userId = await getSupabaseUser(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sellerRow } = await supabaseAdmin
    .from('sellers').select('id').eq('user_id', userId).maybeSingle()
  const { data: userRow } = await supabaseAdmin
    .from('users').select('role').eq('id', userId).maybeSingle()

  const isAdmin = userRow?.role === 'admin'
  const sellerId = sellerRow?.id || null

  let query = supabaseAdmin
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false })

  if (isAdmin) {
    query = query.eq('admin_id', userId)
  } else if (sellerId) {
    query = query.or(`customer_id.eq.${userId},seller_id.eq.${sellerId}`)
  } else {
    query = query.or(`customer_id.eq.${userId},admin_id.eq.${userId}`)
  }

  const { data: sessions, error } = await query
  if (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }

  const enriched = await enrichSessions(sessions || [], userId)
  return NextResponse.json({ sessions: enriched })
}

// ─── POST /api/chat/sessions ────────────────────────────────
// Body: { type: 'seller_customer'|'admin_customer'|'admin_seller', seller_id?, product_id?, title?, first_message? }
export async function POST(request: NextRequest) {
  const userId = await getSupabaseUser(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { type, seller_id, product_id, title, first_message } = body

  if (!type || !['seller_customer', 'admin_customer', 'admin_seller'].includes(type)) {
    return NextResponse.json({ error: 'Invalid chat type' }, { status: 400 })
  }

  let sessionData: any = {
    session_type: type,
    status: 'open',
    title: title || null,
    product_id: product_id || null,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  if (type === 'seller_customer') {
    if (!seller_id) return NextResponse.json({ error: 'seller_id required' }, { status: 400 })
    sessionData.customer_id = userId
    sessionData.seller_id = seller_id

    let existingQuery = supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'seller_customer')
      .eq('customer_id', userId)
      .eq('seller_id', seller_id)
      .eq('status', 'open')
    if (product_id) existingQuery = existingQuery.eq('product_id', product_id)
    const { data: existing } = await existingQuery.maybeSingle()
    if (existing) {
      const enriched = await enrichSessions([existing], userId)
      return NextResponse.json({ session: enriched[0] })
    }
  }

  if (type === 'admin_customer') {
    const adminId = await getAdminUserId()
    if (!adminId) return NextResponse.json({ error: 'No admin available' }, { status: 503 })
    sessionData.customer_id = userId
    sessionData.admin_id = adminId

    const { data: existing } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'admin_customer')
      .eq('customer_id', userId)
      .eq('status', 'open')
      .maybeSingle()
    if (existing) {
      const enriched = await enrichSessions([existing], userId)
      return NextResponse.json({ session: enriched[0] })
    }
  }

  if (type === 'admin_seller') {
    const { data: sellerRow } = await supabaseAdmin
      .from('sellers').select('id').eq('user_id', userId).maybeSingle()
    if (!sellerRow) return NextResponse.json({ error: 'Seller profile not found' }, { status: 400 })
    const adminId = await getAdminUserId()
    if (!adminId) return NextResponse.json({ error: 'No admin available' }, { status: 503 })
    sessionData.seller_id = sellerRow.id
    sessionData.admin_id = adminId

    const { data: existing } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('session_type', 'admin_seller')
      .eq('seller_id', sellerRow.id)
      .eq('status', 'open')
      .maybeSingle()
    if (existing) {
      const enriched = await enrichSessions([existing], userId)
      return NextResponse.json({ session: enriched[0] })
    }
  }

  const { data: newSession, error: createError } = await supabaseAdmin
    .from('chat_sessions')
    .insert([sessionData])
    .select()
    .single()

  if (createError) {
    console.error('Error creating session:', createError)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }

  if (first_message?.trim()) {
    await supabaseAdmin.from('chat_messages').insert([{
      session_id: newSession.id,
      sender_id: userId,
      content: first_message.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    }])
    await supabaseAdmin
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', newSession.id)
  }

  const enriched = await enrichSessions([newSession], userId)
  return NextResponse.json({ session: enriched[0] }, { status: 201 })
}

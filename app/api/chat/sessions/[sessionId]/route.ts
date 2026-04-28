import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSupabaseUser } from '@/lib/supabase-auth-middleware'

// GET /api/chat/sessions/[sessionId] — fetch session + messages
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const userId = await getSupabaseUser(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session, error: sessionError } = await supabaseAdmin
    .from('chat_sessions')
    .select('*')
    .eq('id', params.sessionId)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Verify the user is a participant
  const { data: sellerRow } = await supabaseAdmin
    .from('sellers').select('id').eq('user_id', userId).maybeSingle()
  const { data: userRow } = await supabaseAdmin
    .from('users').select('role').eq('id', userId).maybeSingle()

  const isAdmin = userRow?.role === 'admin'
  const isParticipant =
    session.customer_id === userId ||
    session.admin_id === userId ||
    (sellerRow && session.seller_id === sellerRow.id) ||
    isAdmin

  if (!isParticipant) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch messages
  const { data: messages, error: msgError } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('session_id', params.sessionId)
    .order('created_at', { ascending: true })

  if (msgError) {
    console.error('Error fetching messages:', msgError)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  // Mark unread messages as read
  const unreadIds = (messages || [])
    .filter((m) => !m.is_read && m.sender_id !== userId)
    .map((m) => m.id)

  if (unreadIds.length > 0) {
    await supabaseAdmin
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', unreadIds)
  }

  return NextResponse.json({ session, messages: messages || [] })
}

// POST /api/chat/sessions/[sessionId] — send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const userId = await getSupabaseUser(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await request.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  // Verify session participation
  const { data: session } = await supabaseAdmin
    .from('chat_sessions').select('*').eq('id', params.sessionId).maybeSingle()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if (session.status === 'closed') return NextResponse.json({ error: 'Session is closed' }, { status: 400 })

  const { data: sellerRow } = await supabaseAdmin
    .from('sellers').select('id').eq('user_id', userId).maybeSingle()
  const { data: userRow } = await supabaseAdmin
    .from('users').select('role').eq('id', userId).maybeSingle()

  const isParticipant =
    session.customer_id === userId ||
    session.admin_id === userId ||
    (sellerRow && session.seller_id === sellerRow.id) ||
    userRow?.role === 'admin'

  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: message, error } = await supabaseAdmin
    .from('chat_messages')
    .insert([{
      session_id: params.sessionId,
      sender_id: userId,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  // Update session updated_at
  await supabaseAdmin
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.sessionId)

  return NextResponse.json({ message }, { status: 201 })
}

// PATCH /api/chat/sessions/[sessionId] — close session
export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const userId = await getSupabaseUser(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await request.json()

  if (action === 'close') {
    const { data: updated, error } = await supabaseAdmin
      .from('chat_sessions')
      .update({ status: 'closed', closed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', params.sessionId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Failed to close session' }, { status: 500 })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

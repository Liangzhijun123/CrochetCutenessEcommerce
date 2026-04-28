import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSupabaseUser } from '@/lib/supabase-auth-middleware'

// GET /api/chat/messages?session_id=xxx — fetch messages for a session
export async function GET(request: NextRequest) {
  const userId = await getSupabaseUser(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const { data: messages, error } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  // Mark unread messages from others as read
  const unreadIds = (messages || [])
    .filter((m) => !m.is_read && m.sender_id !== userId)
    .map((m) => m.id)

  if (unreadIds.length > 0) {
    await supabaseAdmin
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', unreadIds)
  }

  return NextResponse.json({ messages: messages || [] })
}

// POST /api/chat/messages — send a message
export async function POST(request: NextRequest) {
  const userId = await getSupabaseUser(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { session_id, content } = await request.json()
  if (!session_id || !content?.trim()) {
    return NextResponse.json({ error: 'session_id and content required' }, { status: 400 })
  }

  const { data: message, error } = await supabaseAdmin
    .from('chat_messages')
    .insert([{
      session_id,
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

  await supabaseAdmin
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', session_id)

  return NextResponse.json({ message }, { status: 201 })
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseDB } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { session_id, content } = await req.json();

    if (!session_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send message
    const message = await supabaseDB.sendChatMessage(session_id, userId, content);

    // Log activity
    await supabaseDB.logActivity(
      userId,
      'sent',
      'chat',
      session_id,
      `Sent message in chat session`
    );

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    const messages = await supabaseDB.getChatMessages(sessionId, limit);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

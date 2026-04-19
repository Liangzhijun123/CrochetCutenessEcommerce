import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseDB } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await supabaseDB.getChatSession(params.sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    const messages = await supabaseDB.getChatMessages(params.sessionId);

    return NextResponse.json({
      session,
      messages,
    });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();
    const userId = authSession?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { status, action } = await req.json();

    if (action === 'close') {
      const updated = await supabaseDB.updateChatSession(params.sessionId, {
        status: 'closed',
        closed_at: new Date(),
      });

      // Log activity
      await supabaseDB.logActivity(
        userId,
        'closed',
        'chat',
        params.sessionId,
        'Chat session closed'
      );

      return NextResponse.json(updated);
    }

    if (action === 'accept') {
      const updated = await supabaseDB.updateChatSession(params.sessionId, {
        status: 'open',
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to update chat session' },
      { status: 500 }
    );
  }
}

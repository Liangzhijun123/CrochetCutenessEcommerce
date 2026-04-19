import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseDB } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { seller_id, customer_id, session_type } = await req.json();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const adminId = session?.user?.id;

    if (!adminId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Create chat session
    const chatSession = await supabaseDB.createChatSession({
      admin_id: adminId,
      seller_id: seller_id || null,
      customer_id: customer_id || null,
      session_type: session_type || 'admin_seller',
      status: 'open',
    });

    return NextResponse.json(chatSession, { status: 201 });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessions = await supabaseDB.getUserChatSessions(userId);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

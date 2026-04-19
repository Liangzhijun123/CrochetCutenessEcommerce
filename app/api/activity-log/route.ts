import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseDB } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Get admin check
    let isAdmin = false;
    if (userId) {
      const user = await supabaseDB.getUser(userId);
      isAdmin = user?.role === 'admin';
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const resourceType = searchParams.get('resource_type');

    let logs = await supabaseDB.getActivityLogs(limit);

    if (resourceType) {
      logs = logs.filter((log) => log.resource_type === resourceType);
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

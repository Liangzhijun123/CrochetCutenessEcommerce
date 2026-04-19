import { NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/supabase-auth-middleware"
import { getUserXPHistory } from "@/lib/supabase-xp"

export async function GET(request: NextRequest) {
  try {
    const userId = await getSupabaseUser(request)
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

    const history = await getUserXPHistory(userId, limit)

    return NextResponse.json({
      history: history.map(tx => ({
        id: tx.id,
        activityType: tx.activity_type,
        xpAmount: tx.xp_amount,
        description: tx.description,
        orderId: tx.order_id,
        createdAt: tx.created_at,
      })),
    })
  } catch (error) {
    console.error("XP history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

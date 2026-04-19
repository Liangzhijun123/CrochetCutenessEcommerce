import { NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/supabase-auth-middleware"
import { awardXP, XP_RATES, type XPActivity } from "@/lib/supabase-xp"

const validActivities = Object.keys(XP_RATES)

export async function POST(request: NextRequest) {
  try {
    const userId = await getSupabaseUser(request)
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { activity, orderId } = body

    if (!activity || !validActivities.includes(activity)) {
      return NextResponse.json(
        { error: "Invalid activity. Must be one of: " + validActivities.join(", ") },
        { status: 400 }
      )
    }

    const result = await awardXP(userId, activity as XPActivity, orderId)

    return NextResponse.json({
      success: true,
      xpAwarded: result.xp_awarded,
      totalXP: result.total_xp,
      activity,
    })
  } catch (error) {
    console.error("Earn XP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/supabase-auth-middleware"
import { getUserXP, getUserRank, XP_TIERS, computeTier } from "@/lib/supabase-xp"

export async function GET(request: NextRequest) {
  try {
    const userId = await getSupabaseUser(request)
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const xpData = await getUserXP(userId)
    const rank = await getUserRank(userId)
    const tier = computeTier(xpData.total_xp)
    const tierInfo = XP_TIERS.find(t => t.name === tier) || XP_TIERS[0]

    return NextResponse.json({
      totalXP: xpData.total_xp,
      tier: xpData.tier,
      rank,
      tierMin: tierInfo.min,
      tierMax: tierInfo.max,
      tierLabel: tierInfo.label,
    })
  } catch (error) {
    console.error("XP balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

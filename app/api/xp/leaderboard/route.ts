import { NextRequest, NextResponse } from "next/server"
import { getSupabaseUser } from "@/lib/supabase-auth-middleware"
import { getLeaderboard, getUserXP, getUserRank } from "@/lib/supabase-xp"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

    // Get authenticated user (optional for leaderboard viewing)
    const userId = await getSupabaseUser(request)

    const leaderboard = await getLeaderboard(limit)

    let currentUser = null
    if (userId) {
      try {
        const xpData = await getUserXP(userId)
        const rank = await getUserRank(userId)
        currentUser = {
          userId,
          xp: xpData.total_xp,
          tier: xpData.tier,
          rank,
        }
      } catch {
        // User may not have XP row yet
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUser,
      totalParticipants: leaderboard.length,
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

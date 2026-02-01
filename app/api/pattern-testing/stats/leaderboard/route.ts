import { NextRequest, NextResponse } from "next/server"
import { initializeDatabase, getTesterLeaderboard } from "@/lib/local-storage-db"

export async function GET(request: NextRequest) {
  try {
    initializeDatabase()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    const leaderboard = getTesterLeaderboard(limit)

    return NextResponse.json({
      success: true,
      leaderboard,
    })
  } catch (error) {
    console.error("[LEADERBOARD] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getTesterStatsByUser,
  createTesterStats,
  getUserById,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Verify user exists
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get or create tester stats
    let stats = getTesterStatsByUser(userId)
    if (!stats) {
      stats = createTesterStats(userId)
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("[MY-STATS] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

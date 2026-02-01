import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getUserById,
  getTestingAnalytics,
  getPatternTestMetrics,
  getTesterStats,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Verify user is admin
    const user = getUserById(userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get overall testing analytics
    const analytics = getTestingAnalytics()

    // Get all pattern metrics
    const patternMetrics = getPatternTestMetrics()

    // Get tester stats summary
    const testerStats = getTesterStats()
    const topTesters = testerStats
      .sort((a, b) => b.totalTestsCompleted - a.totalTestsCompleted)
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      analytics: {
        overview: analytics,
        patternMetrics,
        topTesters,
      },
    })
  } catch (error) {
    console.error("[ADMIN-TESTING-ANALYTICS] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

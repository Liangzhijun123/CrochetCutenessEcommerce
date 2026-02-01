import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getPatternTestMetricsByPattern,
  updatePatternTestMetrics,
  getPatternById,
  getUserById,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { patternId, userId } = await request.json()

    if (!patternId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify pattern exists
    const pattern = getPatternById(patternId)
    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 })
    }

    // Verify user is the creator or admin
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (pattern.creatorId !== userId && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get or update metrics
    let metrics = getPatternTestMetricsByPattern(patternId)
    if (!metrics) {
      metrics = updatePatternTestMetrics(patternId)
    }

    return NextResponse.json({
      success: true,
      metrics,
    })
  } catch (error) {
    console.error("[PATTERN-METRICS] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

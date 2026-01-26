import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, getItem } from "@/lib/local-storage-db"
import type { PatternTestingApplication } from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    console.log("\n[PATTERN-TESTING-MY-APPLICATION] Request received")
    initializeDatabase()

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const applications = getItem("crochet_pattern_testing_applications", []) as PatternTestingApplication[]
    const application = applications.find((app) => app.userId === userId) || null

    return NextResponse.json({ application })
  } catch (error) {
    console.error("[PATTERN-TESTING-MY-APPLICATION] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

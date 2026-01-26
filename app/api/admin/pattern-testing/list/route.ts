import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, getItem } from "@/lib/local-storage-db"
import type { PatternTestingApplication } from "@/lib/local-storage-db"

export async function GET() {
  try {
    console.log("[ADMIN-APPS-LIST] Fetching pattern testing applications")
    initializeDatabase()
    const applications = getItem("crochet_pattern_testing_applications", []) as PatternTestingApplication[]
    return NextResponse.json({ applications })
  } catch (error) {
    console.error("[ADMIN-APPS-LIST] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

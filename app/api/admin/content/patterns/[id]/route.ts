import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { updatePattern, initializeDatabase } from "@/lib/local-storage-db"

// PUT /api/admin/content/patterns/[id] - Moderate a pattern
async function moderatePattern(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    initializeDatabase()
    
    const { action, moderationNotes } = await request.json()
    const patternId = params.id

    if (!action || !["approve", "reject", "flag"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      flag: "flagged",
    }

    const updatedPattern = updatePattern(patternId, {
      moderationStatus: statusMap[action],
      moderationNotes,
      moderatedBy: user.id,
      moderatedAt: new Date().toISOString(),
    })

    if (!updatedPattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      pattern: updatedPattern,
    })
  } catch (error) {
    console.error("Moderate pattern error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PUT = withAdminAuth(moderatePattern)

import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { updateCompetitionEntry, initializeDatabase } from "@/lib/local-storage-db"

// PUT /api/admin/content/entries/[id] - Moderate a competition entry
async function moderateEntry(
  request: NextRequest,
  user: any,
  { params }: { params: { id: string } }
) {
  try {
    initializeDatabase()
    
    const { action, moderationNotes } = await request.json()
    const entryId = params.id

    if (!action || !["approve", "reject", "flag"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const statusMap: Record<string, string> = {
      approve: "approved",
      reject: "rejected",
      flag: "flagged",
    }

    const updatedEntry = updateCompetitionEntry(entryId, {
      moderationStatus: statusMap[action],
      moderationNotes,
      moderatedBy: user.id,
      moderatedAt: new Date().toISOString(),
    })

    if (!updatedEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
    })
  } catch (error) {
    console.error("Moderate entry error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PUT = withAdminAuth(moderateEntry)

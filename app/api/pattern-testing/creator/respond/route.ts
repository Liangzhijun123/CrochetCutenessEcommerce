import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getPatternTestFeedbackById,
  updatePatternTestFeedback,
  getUserById,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { feedbackId, userId, response } = await request.json()

    if (!feedbackId || !userId || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify feedback exists
    const feedback = getPatternTestFeedbackById(feedbackId)
    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Verify user is the creator
    if (feedback.creatorId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update feedback with response
    const updatedFeedback = updatePatternTestFeedback(feedbackId, {
      response,
      respondedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      feedback: updatedFeedback,
      message: "Response submitted successfully",
    })
  } catch (error) {
    console.error("[CREATOR-RESPOND] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getPatternTestAssignmentById,
  createPatternTestFeedback,
  getUserById,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { assignmentId, userId, type, message, images, rating, clarity, accuracy, difficulty } =
      await request.json()

    if (!assignmentId || !userId || !type || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify assignment exists
    const assignment = getPatternTestAssignmentById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Verify user owns this assignment
    if (assignment.testerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate feedback type
    const validTypes = ["question", "issue", "progress_update", "final_review"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 })
    }

    // For final_review, require rating and other metrics
    if (type === "final_review") {
      if (!rating || !clarity || !accuracy || !difficulty) {
        return NextResponse.json(
          { error: "Final review requires rating, clarity, accuracy, and difficulty" },
          { status: 400 }
        )
      }
    }

    // Create the feedback
    const feedback = createPatternTestFeedback({
      assignmentId: assignment.id,
      testerId: assignment.testerId,
      patternId: assignment.patternId,
      creatorId: assignment.creatorId,
      type,
      message,
      images,
      rating,
      clarity,
      accuracy,
      difficulty,
    })

    return NextResponse.json({
      success: true,
      feedback,
      message: "Feedback submitted successfully",
    })
  } catch (error) {
    console.error("[SUBMIT-FEEDBACK] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

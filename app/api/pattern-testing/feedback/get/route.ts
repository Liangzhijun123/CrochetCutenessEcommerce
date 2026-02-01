import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getPatternTestAssignmentById,
  getPatternTestFeedbackByAssignment,
  getUserById,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { assignmentId, userId } = await request.json()

    if (!assignmentId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify assignment exists
    const assignment = getPatternTestAssignmentById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Verify user is either the tester or the creator
    if (assignment.testerId !== userId && assignment.creatorId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all feedback for this assignment
    const feedback = getPatternTestFeedbackByAssignment(assignmentId)

    // Enrich feedback with user details
    const enrichedFeedback = feedback.map((f) => {
      const tester = getUserById(f.testerId)
      const creator = getUserById(f.creatorId)

      return {
        ...f,
        tester: tester
          ? {
              id: tester.id,
              name: tester.name,
            }
          : null,
        creator: creator
          ? {
              id: creator.id,
              name: creator.name,
            }
          : null,
      }
    })

    return NextResponse.json({
      success: true,
      feedback: enrichedFeedback,
    })
  } catch (error) {
    console.error("[GET-FEEDBACK] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

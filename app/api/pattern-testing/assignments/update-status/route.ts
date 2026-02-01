import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getPatternTestAssignmentById,
  updatePatternTestAssignment,
  getUserById,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { assignmentId, userId, status, progress } = await request.json()

    if (!assignmentId || !userId || !status) {
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

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ["accepted", "cancelled"],
      accepted: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    }

    if (!validTransitions[assignment.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${assignment.status} to ${status}` },
        { status: 400 }
      )
    }

    // Prepare updates
    const updates: any = { status }

    if (status === "accepted") {
      updates.acceptedAt = new Date().toISOString()
    } else if (status === "in_progress") {
      updates.startedAt = new Date().toISOString()
      updates.progress = progress || 0
    } else if (status === "completed") {
      updates.completedAt = new Date().toISOString()
      updates.progress = 100
    }

    // If progress is provided and status is in_progress, update it
    if (status === "in_progress" && progress !== undefined) {
      updates.progress = Math.min(100, Math.max(0, progress))
    }

    // Update the assignment
    const updatedAssignment = updatePatternTestAssignment(assignmentId, updates)

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      message: `Assignment status updated to ${status}`,
    })
  } catch (error) {
    console.error("[UPDATE-ASSIGNMENT-STATUS] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

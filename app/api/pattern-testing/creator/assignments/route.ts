import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getPatternTestAssignmentsByCreator,
  getPatternById,
  getUserById,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Verify user exists and is a creator
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "creator") {
      return NextResponse.json({ error: "Only creators can access this endpoint" }, { status: 403 })
    }

    // Get all assignments for this creator's patterns
    const assignments = getPatternTestAssignmentsByCreator(userId)

    // Enrich assignments with pattern and tester details
    const enrichedAssignments = assignments.map((assignment) => {
      const pattern = getPatternById(assignment.patternId)
      const tester = getUserById(assignment.testerId)

      return {
        ...assignment,
        pattern: pattern
          ? {
              id: pattern.id,
              title: pattern.title,
              description: pattern.description,
              thumbnailUrl: pattern.thumbnailUrl,
              difficultyLevel: pattern.difficultyLevel,
            }
          : null,
        tester: tester
          ? {
              id: tester.id,
              name: tester.name,
              testerLevel: tester.testerLevel || 1,
              testerXP: tester.testerXP || 0,
            }
          : null,
      }
    })

    // Group by status
    const byStatus = {
      pending: enrichedAssignments.filter((a) => a.status === "pending"),
      accepted: enrichedAssignments.filter((a) => a.status === "accepted"),
      inProgress: enrichedAssignments.filter((a) => a.status === "in_progress"),
      completed: enrichedAssignments.filter((a) => a.status === "completed"),
      cancelled: enrichedAssignments.filter((a) => a.status === "cancelled"),
    }

    return NextResponse.json({
      success: true,
      assignments: {
        all: enrichedAssignments,
        byStatus,
      },
    })
  } catch (error) {
    console.error("[CREATOR-ASSIGNMENTS] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

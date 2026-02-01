import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getPatternTestAssignmentsByTester,
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

    // Verify user exists
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all assignments for this user
    const assignments = getPatternTestAssignmentsByTester(userId)

    // Enrich assignments with pattern and creator details
    const enrichedAssignments = assignments.map((assignment) => {
      const pattern = getPatternById(assignment.patternId)
      const creator = getUserById(assignment.creatorId)

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
        creator: creator
          ? {
              id: creator.id,
              name: creator.name,
              email: creator.email,
            }
          : null,
      }
    })

    // Separate by status
    const pending = enrichedAssignments.filter((a) => a.status === "pending")
    const accepted = enrichedAssignments.filter((a) => a.status === "accepted")
    const inProgress = enrichedAssignments.filter((a) => a.status === "in_progress")
    const completed = enrichedAssignments.filter((a) => a.status === "completed")
    const cancelled = enrichedAssignments.filter((a) => a.status === "cancelled")

    return NextResponse.json({
      success: true,
      assignments: {
        all: enrichedAssignments,
        pending,
        accepted,
        inProgress,
        completed,
        cancelled,
      },
    })
  } catch (error) {
    console.error("[MY-ASSIGNMENTS] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

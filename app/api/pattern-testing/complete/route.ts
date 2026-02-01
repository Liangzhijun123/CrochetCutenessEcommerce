import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getPatternTestAssignmentById,
  completePatternTest,
  getUserById,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { assignmentId, userId, rating, message, images, clarity, accuracy, difficulty } =
      await request.json()

    if (!assignmentId || !userId || !rating || !message || !clarity || !accuracy || !difficulty) {
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

    // Verify assignment is in progress
    if (assignment.status !== "in_progress") {
      return NextResponse.json(
        { error: "Assignment must be in progress to complete" },
        { status: 400 }
      )
    }

    // Validate ratings
    if (rating < 1 || rating > 5 || clarity < 1 || clarity > 5 || accuracy < 1 || accuracy > 5) {
      return NextResponse.json({ error: "Ratings must be between 1 and 5" }, { status: 400 })
    }

    if (!["easier", "as_expected", "harder"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty value" }, { status: 400 })
    }

    // Complete the test and award rewards
    const result = completePatternTest(assignmentId, {
      rating,
      message,
      images,
      clarity,
      accuracy,
      difficulty,
    })

    return NextResponse.json({
      success: true,
      assignment: result.assignment,
      rewards: result.rewards,
      message: `Test completed! You earned ${result.rewards.coins} coins, ${result.rewards.points} points, and ${result.rewards.xp} XP!`,
    })
  } catch (error) {
    console.error("[COMPLETE-TEST] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import {
  initializeDatabase,
  getUserById,
  getPatternById,
  createPatternTestAssignment,
  getPatternTestAssignmentsByTester,
  getPatternTestAssignmentsByPattern,
} from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    initializeDatabase()

    const { userId, patternId } = await request.json()

    if (!userId || !patternId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user exists and is approved tester
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.patternTestingApproved) {
      return NextResponse.json(
        { error: "You must be an approved pattern tester to apply" },
        { status: 403 }
      )
    }

    // Verify pattern exists
    const pattern = getPatternById(patternId)
    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 })
    }

    // Check if user already has an assignment for this pattern
    const existingAssignments = getPatternTestAssignmentsByTester(userId)
    const hasExistingAssignment = existingAssignments.some(
      (a) => a.patternId === patternId && ["pending", "accepted", "in_progress"].includes(a.status)
    )

    if (hasExistingAssignment) {
      return NextResponse.json(
        { error: "You already have an active assignment for this pattern" },
        { status: 409 }
      )
    }

    // Check if pattern has reached max testers
    const patternAssignments = getPatternTestAssignmentsByPattern(patternId)
    const activeAssignments = patternAssignments.filter((a) =>
      ["pending", "accepted", "in_progress"].includes(a.status)
    )

    // For now, allow up to 5 testers per pattern
    const maxTesters = 5
    if (activeAssignments.length >= maxTesters) {
      return NextResponse.json(
        { error: "This pattern has reached the maximum number of testers" },
        { status: 409 }
      )
    }

    // Calculate rewards based on pattern difficulty and estimated time
    const estimatedHours = pattern.estimatedTime ? parseInt(pattern.estimatedTime.split("-")[0]) : 5
    const rewardCoins = estimatedHours * 10 // 10 coins per estimated hour
    const rewardPoints = estimatedHours * 5 // 5 points per estimated hour

    // Calculate deadline (7 days from now by default)
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 7)

    // Create the assignment
    const assignment = createPatternTestAssignment({
      patternId,
      testerId: userId,
      creatorId: pattern.creatorId,
      deadline: deadline.toISOString(),
      estimatedHours,
      rewardCoins,
      rewardPoints,
    })

    return NextResponse.json({
      success: true,
      assignment,
      message: "Successfully applied to test this pattern",
    })
  } catch (error) {
    console.error("[PATTERN-TEST-APPLY] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getUserById, initializeDatabase, setItem, getItem, PatternTestingApplication } from "@/lib/local-storage-db"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    console.log("\n[PATTERN-TESTING-APPLY] ========== APPLICATION SUBMISSION ==========")
    initializeDatabase()

    const { userId, whyTesting, experienceLevel, availability, comments } = await request.json()
    console.log(`[PATTERN-TESTING-APPLY] User ID: ${userId}`)
    console.log(`[PATTERN-TESTING-APPLY] Experience: ${experienceLevel}, Availability: ${availability}`)

    if (!userId || !whyTesting || !experienceLevel || !availability) {
      console.log("[PATTERN-TESTING-APPLY] ❌ Missing required fields")
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    // Get user info
    const user = getUserById(userId)
    if (!user) {
      console.log(`[PATTERN-TESTING-APPLY] ❌ User not found: ${userId}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has a pending or approved application
    const applications = getItem("crochet_pattern_testing_applications", []) as PatternTestingApplication[]
    const existingApp = applications.find((app) => app.userId === userId)
    if (existingApp && existingApp.status === "pending") {
      console.log(`[PATTERN-TESTING-APPLY] ❌ User already has pending application`)
      return NextResponse.json({ error: "You already have a pending application" }, { status: 409 })
    }

    // Create new application
    const newApplication: PatternTestingApplication = {
      id: randomUUID(),
      userId,
      userName: user.name,
      userEmail: user.email,
      whyTesting,
      experienceLevel: experienceLevel as "beginner" | "intermediate" | "advanced",
      availability,
      comments,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    console.log(`[PATTERN-TESTING-APPLY] Creating application - ID: ${newApplication.id}`)
    applications.push(newApplication)
    console.log(`[PATTERN-TESTING-APPLY] Saving ${applications.length} applications to database`)
    setItem("crochet_pattern_testing_applications", applications)

    console.log(`[PATTERN-TESTING-APPLY] ✅ Application submitted successfully`)
    console.log("[PATTERN-TESTING-APPLY] ========== APPLICATION SAVED ==========\n")

    return NextResponse.json({
      message: "Application submitted successfully. Pending admin review.",
      application: newApplication,
    })
  } catch (error) {
    console.error("[PATTERN-TESTING-APPLY] ❌ Error:", error)
    console.log("[PATTERN-TESTING-APPLY] ========== APPLICATION FAILED ==========\n")
    return NextResponse.json({ error: "An error occurred while submitting the application" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, getItem, setItem, getUserById, updateUser } from "@/lib/local-storage-db"
import { PatternTestingApplication } from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    console.log("\n[ADMIN-APPROVE] ========== APPROVE REQUEST ==========")
    initializeDatabase()

    const { applicationId, adminId } = await request.json()
    console.log(`[ADMIN-APPROVE] Application ID: ${applicationId}, Admin ID: ${adminId}`)

    if (!applicationId || !adminId) {
      console.log("[ADMIN-APPROVE] ❌ Missing required fields")
      return NextResponse.json({ error: "Application ID and Admin ID are required" }, { status: 400 })
    }

    // Verify admin
    const admin = getUserById(adminId)
    if (!admin || admin.role !== "admin") {
      console.log(`[ADMIN-APPROVE] ❌ Not authorized - user is not admin`)
      return NextResponse.json({ error: "Only admins can approve applications" }, { status: 403 })
    }

    // Get applications
    const applications = getItem("crochet_pattern_testing_applications", []) as PatternTestingApplication[]
    const appIndex = applications.findIndex((app) => app.id === applicationId)

    if (appIndex === -1) {
      console.log(`[ADMIN-APPROVE] ❌ Application not found: ${applicationId}`)
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const application = applications[appIndex]
    console.log(`[ADMIN-APPROVE] Found application for user: ${application.userEmail}`)

    // Update application status
    application.status = "approved"
    application.reviewedAt = new Date().toISOString()
    application.reviewedBy = adminId
    console.log(`[ADMIN-APPROVE] Application status updated to approved`)

    // Update user - grant access and set tester level 1
    const user = getUserById(application.userId)
    if (user) {
      console.log(`[ADMIN-APPROVE] Updating user with tester access...`)
      updateUser(application.userId, {
        patternTestingApproved: true,
        testerLevel: 1,
        testerXP: 0,
        patternTestingApplicationId: applicationId,
      })
      console.log(`[ADMIN-APPROVE] ✅ User updated - testerLevel: 1, approved: true`)
    }

    // Save updated applications
    applications[appIndex] = application
    setItem("crochet_pattern_testing_applications", applications)
    console.log(`[ADMIN-APPROVE] ✅ Application approved and saved`)
    console.log("[ADMIN-APPROVE] ========== APPROVE SUCCESSFUL ==========\n")

    return NextResponse.json({
      message: "Application approved successfully",
      application,
    })
  } catch (error) {
    console.error("[ADMIN-APPROVE] ❌ Error:", error)
    console.log("[ADMIN-APPROVE] ========== APPROVE FAILED ==========\n")
    return NextResponse.json({ error: "An error occurred while approving the application" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, getItem, setItem, getUserById } from "@/lib/local-storage-db"
import { PatternTestingApplication } from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    console.log("\n[ADMIN-DISAPPROVE] ========== DISAPPROVE REQUEST ==========")
    initializeDatabase()

    const { applicationId, adminId, reason } = await request.json()
    console.log(`[ADMIN-DISAPPROVE] Application ID: ${applicationId}, Admin ID: ${adminId}`)

    if (!applicationId || !adminId) {
      console.log("[ADMIN-DISAPPROVE] ❌ Missing required fields")
      return NextResponse.json({ error: "Application ID and Admin ID are required" }, { status: 400 })
    }

    // Verify admin
    const admin = getUserById(adminId)
    if (!admin || admin.role !== "admin") {
      console.log(`[ADMIN-DISAPPROVE] ❌ Not authorized - user is not admin`)
      return NextResponse.json({ error: "Only admins can disapprove applications" }, { status: 403 })
    }

    // Get applications
    const applications = getItem("crochet_pattern_testing_applications", []) as PatternTestingApplication[]
    const appIndex = applications.findIndex((app) => app.id === applicationId)

    if (appIndex === -1) {
      console.log(`[ADMIN-DISAPPROVE] ❌ Application not found: ${applicationId}`)
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const application = applications[appIndex]
    console.log(`[ADMIN-DISAPPROVE] Found application for user: ${application.userEmail}`)

    // Update application status
    application.status = "disapproved"
    application.reviewedAt = new Date().toISOString()
    application.reviewedBy = adminId
    application.comments = reason || application.comments
    console.log(`[ADMIN-DISAPPROVE] Application status updated to disapproved`)

    // Save updated applications
    applications[appIndex] = application
    setItem("crochet_pattern_testing_applications", applications)
    console.log(`[ADMIN-DISAPPROVE] ✅ Application disapproved and saved`)
    console.log("[ADMIN-DISAPPROVE] ========== DISAPPROVE SUCCESSFUL ==========\n")

    return NextResponse.json({
      message: "Application disapproved successfully",
      application,
    })
  } catch (error) {
    console.error("[ADMIN-DISAPPROVE] ❌ Error:", error)
    console.log("[ADMIN-DISAPPROVE] ========== DISAPPROVE FAILED ==========\n")
    return NextResponse.json({ error: "An error occurred while disapproving the application" }, { status: 500 })
  }
}

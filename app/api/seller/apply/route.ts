import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()

    // Validate required fields
    if (!applicationData.userId || !applicationData.name || !applicationData.email || !applicationData.bio) {
      return NextResponse.json({ error: "User ID, name, email, and bio are required" }, { status: 400 })
    }

    // Check if user exists
    const user = db.getUserById(applicationData.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has an application
    const existingApplication = db.getSellerApplicationByUserId(applicationData.userId)
    if (existingApplication) {
      return NextResponse.json(
        { error: "You already have a pending application", application: existingApplication },
        { status: 409 },
      )
    }

    // Create new application
    const newApplication = db.createSellerApplication(applicationData)

    return NextResponse.json({
      application: newApplication,
      message: "Application submitted successfully",
    })
  } catch (error) {
    console.error("Error creating seller application:", error)
    return NextResponse.json({ error: "An error occurred while submitting your application" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createSellerApplication, getSellerApplicationByUserId } from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()

    // Validate required fields
    if (!applicationData.userId || !applicationData.name || !applicationData.email || !applicationData.bio) {
      return NextResponse.json({ error: "User ID, name, email, and bio are required" }, { status: 400 })
    }

    // Check if user already has an application
    const existingApplication = getSellerApplicationByUserId(applicationData.userId)
    if (existingApplication) {
      return NextResponse.json({ error: "You already have a pending application" }, { status: 409 })
    }

    const newApplication = createSellerApplication(applicationData)

    return NextResponse.json({ application: newApplication }, { status: 201 })
  } catch (error) {
    console.error("Error creating seller application:", error)
    return NextResponse.json({ error: "An error occurred while creating the application" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createSellerApplication, getSellerApplicationByUserId } from "@/lib/local-storage-db"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()

    // Validate required fields
    if (!applicationData.userId || !applicationData.name || !applicationData.email || !applicationData.bio) {
      return NextResponse.json({ error: "User ID, name, email, and bio are required" }, { status: 400 })
    }

    if (!applicationData.businessName || !applicationData.businessType || !applicationData.yearsExperience) {
      return NextResponse.json({ error: "Business name, business type, and years of experience are required" }, { status: 400 })
    }

    if (!applicationData.specialties || !applicationData.whyJoin || !applicationData.expectedMonthlyListings) {
      return NextResponse.json({ error: "Specialties, reason for joining, and expected monthly listings are required" }, { status: 400 })
    }

    // Check if user already has an application
    const existingApplication = getSellerApplicationByUserId(applicationData.userId)
    if (existingApplication) {
      return NextResponse.json({ error: "You already have a pending application" }, { status: 409 })
    }

    const newApplication = createSellerApplication(applicationData)

    // Send confirmation email to applicant
    try {
      await sendEmail(applicationData.email, "seller-application-submitted", {
        name: applicationData.name,
        businessName: applicationData.businessName,
        submittedAt: newApplication.createdAt,
      })
    } catch (emailError) {
      console.error("Failed to send application confirmation email:", emailError)
      // Don't fail the application creation if email fails
    }

    return NextResponse.json({ application: newApplication }, { status: 201 })
  } catch (error) {
    console.error("Error creating seller application:", error)
    return NextResponse.json({ error: "An error occurred while creating the application" }, { status: 500 })
  }
}

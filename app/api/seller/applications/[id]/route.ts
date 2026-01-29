import { type NextRequest, NextResponse } from "next/server"
import { getSellerApplicationById, updateSellerApplication, getUserById, updateUser } from "@/lib/local-storage-db"
import { sendEmail } from "@/lib/email-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const application = getSellerApplicationById(params.id)

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "An error occurred while fetching the application" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    // Check if application exists
    const existingApplication = getSellerApplicationById(params.id)
    if (!existingApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Add review metadata
    const reviewUpdates = {
      ...updates,
      reviewedAt: new Date().toISOString(),
      reviewedBy: updates.reviewedBy || "admin", // Should be passed from frontend
    }

    const updatedApplication = updateSellerApplication(params.id, reviewUpdates)

    // Send notification emails based on status
    try {
      const user = getUserById(updatedApplication.userId)
      if (user) {
        if (updatedApplication.status === "approved") {
          // Generate a temporary password for demo purposes
          const tempPassword = crypto.randomUUID().slice(0, 8)

          // Update the user's password (demo only) — in real apps use proper password reset flows
          updateUser(user.id, { password: tempPassword })

          // Send approval email with login credentials
          await sendEmail(user.email, "seller-application-approved", {
            name: user.name,
            businessName: updatedApplication.businessName || "your business",
            email: user.email,
            temporaryPassword: tempPassword,
            loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login`,
            dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller-dashboard`,
            adminFeedback: updatedApplication.adminFeedback,
          })
        } else if (updatedApplication.status === "rejected") {
          // Send rejection email
          await sendEmail(user.email, "seller-application-rejected", {
            name: user.name,
            businessName: updatedApplication.businessName || "your business",
            adminFeedback: updatedApplication.adminFeedback || "Please review your application and consider reapplying in the future.",
            reapplyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/become-seller`,
          })
        }
      }
    } catch (emailError) {
      console.error("Failed to send application status email:", emailError)
      // Don't fail the update if email fails
    }

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "An error occurred while updating the application" }, { status: 500 })
  }
}

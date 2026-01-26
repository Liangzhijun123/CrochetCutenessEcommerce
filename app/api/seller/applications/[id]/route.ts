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

    const updatedApplication = updateSellerApplication(params.id, updates)

    // If application was approved, send login info email to the applicant
    try {
      if (updatedApplication.status === "approved") {
        const user = getUserById(updatedApplication.userId)
        if (user) {
          // Generate a temporary password for demo purposes
          const tempPassword = crypto.randomUUID().slice(0, 8)

          // Update the user's password (demo only) — in real apps use proper password reset flows
          updateUser(user.id, { password: tempPassword })

          // Send the login info email
          await sendEmail(user.email, "seller-approval-login", {
            email: user.email,
            temporaryPassword: tempPassword,
            note: "You can log in at /auth/login. Change your password after signing in.",
          })
        }
      }
    } catch (err) {
      console.error("Error sending approval email:", err)
    }

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "An error occurred while updating the application" }, { status: 500 })
  }
}

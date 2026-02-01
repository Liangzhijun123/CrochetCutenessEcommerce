import { type NextRequest, NextResponse } from "next/server"
import { updateUser, getUserById } from "@/lib/local-storage-db"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, onboardingData } = await request.json()

    if (!userId || !onboardingData) {
      return NextResponse.json({ error: "User ID and onboarding data are required" }, { status: 400 })
    }

    // Get the current user
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user with onboarding completion
    const updatedUser = updateUser(userId, {
      sellerProfile: {
        ...user.sellerProfile,
        ...onboardingData,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
        status: "active", // Activate the seller account
      }
    })

    // Send welcome email
    try {
      await sendEmail(user.email, "seller-onboarding-welcome", {
        name: user.name,
        storeName: onboardingData.storeName || "your store",
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller-dashboard`,
        supportUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contact`,
        guideUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller-guide`,
      })
    } catch (emailError) {
      console.error("Failed to send onboarding welcome email:", emailError)
      // Don't fail the onboarding if email fails
    }

    return NextResponse.json({ 
      user: updatedUser,
      message: "Onboarding completed successfully" 
    })
  } catch (error) {
    console.error("Error completing onboarding:", error)
    return NextResponse.json({ error: "An error occurred while completing onboarding" }, { status: 500 })
  }
}
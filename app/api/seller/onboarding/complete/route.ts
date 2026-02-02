import { type NextRequest, NextResponse } from "next/server"
import { updateUser, getUserById } from "@/lib/local-storage-db"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  console.log("🔵 POST /api/seller/onboarding/complete called")
  
  try {
    const body = await request.json()
    console.log("📦 Request body:", body)
    
    const { userId, onboardingData, user: clientUser } = body

    if (!userId || !onboardingData) {
      console.error("❌ Missing userId or onboardingData")
      return NextResponse.json({ error: "User ID and onboarding data are required" }, { status: 400 })
    }

    console.log("👤 Getting user:", userId)
    // Get the current user - try server-side first, then use client-provided user
    let user = getUserById(userId)
    
    if (!user && clientUser) {
      console.log("⚠️ User not found in server DB, using client-provided user data")
      user = clientUser
    }
    
    if (!user) {
      console.error("❌ User not found:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("✅ User found:", user.email)
    console.log("📝 Updating user with onboarding data...")

    // Create updated user object with seller role
    const updatedUser = {
      ...user,
      role: "seller" as const, // Set role to seller
      sellerProfile: {
        ...(user.sellerProfile || {}),
        ...onboardingData,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
        status: "active" as const,
      }
    }

    // Try to update in server DB if user exists there
    try {
      updateUser(userId, {
        sellerProfile: updatedUser.sellerProfile
      })
      console.log("✅ User updated in server DB")
    } catch (error) {
      console.log("⚠️ Could not update server DB (user may only exist in browser):", error)
      // This is okay - user will be updated in browser localStorage
    }

    console.log("✅ User updated successfully")

    // Send welcome email
    try {
      await sendEmail(user.email, "seller-onboarding-welcome", {
        name: user.name,
        storeName: onboardingData.storeName || "your store",
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller-dashboard`,
        supportUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contact`,
        guideUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller-guide`,
      })
      console.log("📧 Welcome email sent")
    } catch (emailError) {
      console.error("⚠️ Failed to send onboarding welcome email:", emailError)
      // Don't fail the onboarding if email fails
    }

    console.log("✅ Onboarding completed successfully")
    return NextResponse.json({ 
      user: updatedUser,
      message: "Onboarding completed successfully" 
    })
  } catch (error) {
    console.error("❌ Error completing onboarding:", error)
    return NextResponse.json({ error: "An error occurred while completing onboarding" }, { status: 500 })
  }
}
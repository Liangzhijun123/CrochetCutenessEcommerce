import { type NextRequest, NextResponse } from "next/server"
import { getUsers, updateUser } from "@/lib/local-storage-db"
import { sendEmail } from "@/lib/email-service"

export async function GET(request: NextRequest) {
  try {
    const users = getUsers()
    
    // Filter to only include sellers/creators
    const sellers = users.filter(user => 
      user.role === "creator" || user.role === "seller"
    )

    return NextResponse.json({ sellers })
  } catch (error) {
    console.error("Error fetching sellers:", error)
    return NextResponse.json({ error: "An error occurred while fetching sellers" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sellerId, updates, adminId } = await request.json()

    if (!sellerId || !updates) {
      return NextResponse.json({ error: "Seller ID and updates are required" }, { status: 400 })
    }

    // Update the seller
    const updatedSeller = updateUser(sellerId, updates)

    // Send notification emails based on status changes
    if (updates.sellerProfile?.status) {
      try {
        const status = updates.sellerProfile.status
        
        if (status === "suspended") {
          await sendEmail(updatedSeller.email, "seller-status-suspended", {
            name: updatedSeller.name,
            reason: updates.sellerProfile.suspensionReason || "Policy violation",
            suspendedUntil: updates.sellerProfile.suspendedUntil,
            supportEmail: "support@crochetcommunity.com",
          })
        } else if (status === "active" && updates.sellerProfile.suspensionReason) {
          // Reactivated after suspension
          await sendEmail(updatedSeller.email, "seller-status-reactivated", {
            name: updatedSeller.name,
            reactivatedAt: new Date().toISOString(),
            dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/seller-dashboard`,
          })
        }
      } catch (emailError) {
        console.error("Failed to send status notification email:", emailError)
        // Don't fail the update if email fails
      }
    }

    // Send verification upgrade notification
    if (updates.sellerProfile?.verificationLevel) {
      try {
        const level = updates.sellerProfile.verificationLevel
        if (level === "verified" || level === "premium") {
          await sendEmail(updatedSeller.email, "seller-verification-upgraded", {
            name: updatedSeller.name,
            verificationLevel: level,
            benefits: level === "premium" 
              ? ["Lower commission rates", "Priority support", "Featured listings", "Advanced analytics"]
              : ["Verified badge", "Increased trust", "Better search ranking"],
          })
        }
      } catch (emailError) {
        console.error("Failed to send verification notification email:", emailError)
      }
    }

    return NextResponse.json({ seller: updatedSeller })
  } catch (error) {
    console.error("Error updating seller:", error)
    return NextResponse.json({ error: "An error occurred while updating the seller" }, { status: 500 })
  }
}
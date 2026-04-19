import { type NextRequest, NextResponse } from "next/server"
import { supabase, supabaseDB } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { user_id, experience, reason, introduction } = await request.json()

    if (!user_id || !experience || !reason || !introduction) {
      return NextResponse.json(
        { error: "All fields are required: experience, reason, and introduction" },
        { status: 400 }
      )
    }

    // Verify the user exists and is a pending_seller
    const user = await supabaseDB.getUser(user_id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    if (user.role !== "pending_seller") {
      return NextResponse.json(
        { error: "Only pending seller accounts can submit applications" },
        { status: 403 }
      )
    }

    // Check if already has a pending/approved application
    const existing = await supabaseDB.getSellerApplication(user_id)
    if (existing) {
      return NextResponse.json(
        { error: "You already have an application on file", application: existing },
        { status: 409 }
      )
    }

    const application = await supabaseDB.createSellerApplication({
      user_id,
      experience,
      reason,
      introduction,
    })

    // Update user profile to track that application was submitted
    await supabase
      .from("users")
      .update({ seller_application_status: "submitted" })
      .eq("id", user_id)

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error("Error creating seller application:", error)
    return NextResponse.json(
      { error: "An error occurred while submitting your application" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id")
    if (!userId) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const application = await supabaseDB.getSellerApplication(userId)
    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error fetching seller application:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching your application" },
      { status: 500 }
    )
  }
}

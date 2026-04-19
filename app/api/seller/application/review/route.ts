import { type NextRequest, NextResponse } from "next/server"
import { supabase, supabaseDB } from "@/lib/supabase"

export async function GET() {
  try {
    const applications = await supabaseDB.getPendingSellerApplications()
    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching pending applications:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching applications" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { application_id, action, admin_feedback } = await request.json()

    if (!application_id || !action) {
      return NextResponse.json(
        { error: "application_id and action are required" },
        { status: 400 }
      )
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    const status = action === "approve" ? "approved" : "rejected"
    const application = await supabaseDB.updateSellerApplicationStatus(
      application_id,
      status,
      admin_feedback
    )

    // If approved, update user role to 'seller'
    if (action === "approve") {
      await supabase
        .from("users")
        .update({ role: "seller", is_seller: true, seller_application_status: "approved" })
        .eq("id", application.user_id)
    } else {
      await supabase
        .from("users")
        .update({ role: "customer", seller_application_status: "rejected" })
        .eq("id", application.user_id)
    }

    return NextResponse.json({ application, message: `Application ${status}` })
  } catch (error) {
    console.error("Error updating seller application:", error)
    return NextResponse.json(
      { error: "An error occurred while updating the application" },
      { status: 500 }
    )
  }
}

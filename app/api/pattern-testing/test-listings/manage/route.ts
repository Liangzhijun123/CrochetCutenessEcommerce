import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// PUT - Seller approves or rejects a signup
export async function PUT(request: NextRequest) {
  try {
    const { signupId, sellerId, action } = await request.json()

    if (!signupId || !sellerId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Action must be 'approve' or 'reject'" }, { status: 400 })
    }

    // Verify signup exists and belongs to a listing owned by this seller
    const { data: signup, error: signupErr } = await supabaseAdmin
      .from("pattern_test_signups")
      .select(`
        id, listing_id, status,
        listing:pattern_test_listings!inner(seller_id, max_testers)
      `)
      .eq("id", signupId)
      .single()

    if (signupErr || !signup) {
      return NextResponse.json({ error: "Signup not found" }, { status: 404 })
    }

    if ((signup.listing as any).seller_id !== sellerId) {
      return NextResponse.json({ error: "You don't own this listing" }, { status: 403 })
    }

    if (signup.status !== "pending") {
      return NextResponse.json({ error: "This signup has already been processed" }, { status: 400 })
    }

    // If approving, check max testers
    if (action === "approve") {
      const { count } = await supabaseAdmin
        .from("pattern_test_signups")
        .select("id", { count: "exact" })
        .eq("listing_id", signup.listing_id)
        .in("status", ["approved", "in_progress", "completed"])

      if (count !== null && count >= (signup.listing as any).max_testers) {
        return NextResponse.json({ error: "Maximum number of testers reached" }, { status: 409 })
      }
    }

    const newStatus = action === "approve" ? "approved" : "rejected"
    const updateData: any = { status: newStatus }
    if (action === "approve") {
      updateData.approved_at = new Date().toISOString()
    }

    const { error } = await supabaseAdmin
      .from("pattern_test_signups")
      .update(updateData)
      .eq("id", signupId)

    if (error) {
      console.error("[MANAGE-SIGNUP] Update error:", error)
      return NextResponse.json({ error: "Failed to update signup" }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error("[MANAGE-SIGNUP] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

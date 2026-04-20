import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET - Seller gets their own test listings with applicant details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 })
    }

    const { data: listings, error } = await supabaseAdmin
      .from("pattern_test_listings")
      .select(`
        *,
        signups:pattern_test_signups(
          id, user_id, message, status, progress, feedback, rating, approved_at, completed_at, created_at,
          user:users!pattern_test_signups_user_id_fkey(id, full_name, email, avatar_url)
        )
      `)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[SELLER-LISTINGS] Error:", error)
      return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
    }

    const result = (listings || []).map((listing) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      difficulty: listing.difficulty,
      maxTesters: listing.max_testers,
      deadline: listing.deadline,
      requirements: listing.requirements,
      imageUrl: listing.image_url,
      patternFileUrl: listing.pattern_file_url,
      status: listing.status,
      createdAt: listing.created_at,
      applicants: (listing.signups || []).map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        userName: s.user?.full_name || "Unknown",
        userEmail: s.user?.email || "",
        userAvatar: s.user?.avatar_url || null,
        message: s.message,
        status: s.status,
        progress: s.progress,
        feedback: s.feedback,
        rating: s.rating,
        approvedAt: s.approved_at,
        completedAt: s.completed_at,
        createdAt: s.created_at,
      })),
    }))

    return NextResponse.json({ success: true, listings: result })
  } catch (error) {
    console.error("[SELLER-LISTINGS] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Seller deletes a test listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get("listingId")
    const sellerId = searchParams.get("sellerId")

    if (!listingId || !sellerId) {
      return NextResponse.json({ error: "Listing ID and Seller ID are required" }, { status: 400 })
    }

    // Verify the listing belongs to the seller
    const { data: listing } = await supabaseAdmin
      .from("pattern_test_listings")
      .select("id, seller_id")
      .eq("id", listingId)
      .eq("seller_id", sellerId)
      .single()

    if (!listing) {
      return NextResponse.json({ error: "Listing not found or not owned by you" }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from("pattern_test_listings")
      .delete()
      .eq("id", listingId)

    if (error) {
      console.error("[SELLER-LISTINGS] Delete error:", error)
      return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SELLER-LISTINGS] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

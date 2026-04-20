import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// POST - Customer signs up to test a pattern
export async function POST(request: NextRequest) {
  try {
    const { userId, listingId, message } = await request.json()

    if (!userId || !listingId) {
      return NextResponse.json({ error: "User ID and Listing ID are required" }, { status: 400 })
    }

    // Verify user exists
    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("id, pattern_testing_approved")
      .eq("id", userId)
      .single()

    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.pattern_testing_approved) {
      return NextResponse.json({ error: "You must be an approved pattern tester to sign up" }, { status: 403 })
    }

    // Verify listing exists and is open
    const { data: listing, error: listingErr } = await supabaseAdmin
      .from("pattern_test_listings")
      .select("id, seller_id, max_testers, status")
      .eq("id", listingId)
      .eq("status", "open")
      .single()

    if (listingErr || !listing) {
      return NextResponse.json({ error: "Listing not found or not open" }, { status: 404 })
    }

    // Don't let sellers sign up for their own listings
    if (listing.seller_id === userId) {
      return NextResponse.json({ error: "You cannot test your own pattern" }, { status: 400 })
    }

    // Check if user already signed up
    const { data: existing } = await supabaseAdmin
      .from("pattern_test_signups")
      .select("id, status")
      .eq("listing_id", listingId)
      .eq("user_id", userId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "You have already applied to test this pattern" }, { status: 409 })
    }

    // Check max testers
    const { count } = await supabaseAdmin
      .from("pattern_test_signups")
      .select("id", { count: "exact" })
      .eq("listing_id", listingId)
      .in("status", ["approved", "in_progress", "completed"])

    if (count !== null && count >= listing.max_testers) {
      return NextResponse.json({ error: "This pattern has reached the maximum number of testers" }, { status: 409 })
    }

    // Create signup
    const { data: signup, error } = await supabaseAdmin
      .from("pattern_test_signups")
      .insert({
        listing_id: listingId,
        user_id: userId,
        message: message || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[SIGNUP] Insert error:", error)
      return NextResponse.json({ error: "Failed to sign up" }, { status: 500 })
    }

    return NextResponse.json({ success: true, signup })
  } catch (error) {
    console.error("[SIGNUP] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get user's signups (their testing queue)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status") // optional filter

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    let query = supabaseAdmin
      .from("pattern_test_signups")
      .select(`
        *,
        listing:pattern_test_listings(
          id, seller_id, title, description, difficulty, deadline, image_url, pattern_file_url, requirements, status,
          seller:users!pattern_test_listings_seller_id_fkey(id, full_name, avatar_url)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data: signups, error } = await query

    if (error) {
      console.error("[MY-SIGNUPS] Error:", error)
      return NextResponse.json({ error: "Failed to fetch signups" }, { status: 500 })
    }

    const result = (signups || []).map((s) => ({
      id: s.id,
      listingId: s.listing_id,
      status: s.status,
      message: s.message,
      progress: s.progress,
      feedback: s.feedback,
      rating: s.rating,
      approvedAt: s.approved_at,
      completedAt: s.completed_at,
      createdAt: s.created_at,
      listing: s.listing ? {
        id: s.listing.id,
        title: s.listing.title,
        description: s.listing.description,
        difficulty: s.listing.difficulty,
        deadline: s.listing.deadline,
        imageUrl: s.listing.image_url,
        patternFileUrl: s.listing.pattern_file_url,
        requirements: s.listing.requirements,
        status: s.listing.status,
        sellerName: s.listing.seller?.full_name || "Unknown",
        sellerAvatar: s.listing.seller?.avatar_url || null,
      } : null,
    }))

    return NextResponse.json({ success: true, signups: result })
  } catch (error) {
    console.error("[MY-SIGNUPS] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

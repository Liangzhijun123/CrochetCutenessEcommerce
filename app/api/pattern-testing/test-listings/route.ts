import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET - List open test listings for approved testers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty")
    const search = searchParams.get("search")

    let query = supabaseAdmin
      .from("pattern_test_listings")
      .select(`
        *,
        seller:users!pattern_test_listings_seller_id_fkey(id, full_name, avatar_url),
        signups:pattern_test_signups(id, user_id, status)
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false })

    if (difficulty && difficulty !== "all") {
      query = query.eq("difficulty", difficulty)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: listings, error } = await query

    if (error) {
      console.error("[TEST-LISTINGS] Error:", error)
      return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
    }

    // Map the data to a cleaner format
    const result = (listings || []).map((listing) => ({
      id: listing.id,
      sellerId: listing.seller_id,
      sellerName: listing.seller?.full_name || "Unknown Seller",
      sellerAvatar: listing.seller?.avatar_url || null,
      title: listing.title,
      description: listing.description,
      difficulty: listing.difficulty,
      maxTesters: listing.max_testers,
      deadline: listing.deadline,
      requirements: listing.requirements,
      imageUrl: listing.image_url,
      patternFileUrl: listing.pattern_file_url,
      status: listing.status,
      currentTesters: (listing.signups || []).filter(
        (s: any) => s.status === "approved" || s.status === "in_progress" || s.status === "completed"
      ).length,
      totalApplicants: (listing.signups || []).length,
      createdAt: listing.created_at,
    }))

    return NextResponse.json({ success: true, listings: result })
  } catch (error) {
    console.error("[TEST-LISTINGS] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Seller creates a new test listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, title, description, difficulty, maxTesters, deadline, requirements, imageUrl, patternFileUrl } = body

    if (!sellerId || !title || !description || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify seller exists and is a seller
    const { data: seller, error: sellerErr } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("id", sellerId)
      .single()

    if (sellerErr || !seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }

    if (seller.role !== "seller" && seller.role !== "creator" && seller.role !== "admin") {
      return NextResponse.json({ error: "Only sellers can create test listings" }, { status: 403 })
    }

    const { data: listing, error } = await supabaseAdmin
      .from("pattern_test_listings")
      .insert({
        seller_id: sellerId,
        title,
        description,
        difficulty: difficulty || "beginner",
        max_testers: maxTesters || 5,
        deadline: deadline || null,
        requirements: requirements || null,
        image_url: imageUrl || null,
        pattern_file_url: patternFileUrl || null,
        status: "open",
      })
      .select()
      .single()

    if (error) {
      console.error("[TEST-LISTINGS] Insert error:", error)
      return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
    }

    return NextResponse.json({ success: true, listing })
  } catch (error) {
    console.error("[TEST-LISTINGS] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// GET reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reviews:", error)
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }

    // Calculate rating distribution
    const total = reviews?.length || 0
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let ratingSum = 0
    for (const review of reviews || []) {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1
      ratingSum += review.rating
    }
    const averageRating = total > 0 ? ratingSum / total : 0
    const ratingDistribution: Record<number, number> = {}
    for (const star of [5, 4, 3, 2, 1]) {
      ratingDistribution[star] = total > 0 ? Math.round((distribution[star] / total) * 100) : 0
    }

    return NextResponse.json({
      reviews: (reviews || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        author: r.user_name,
        rating: r.rating,
        title: r.title,
        content: r.content,
        images: r.images || [],
        helpful: r.helpful_count || 0,
        date: r.created_at,
      })),
      averageRating,
      reviewCount: total,
      ratingDistribution,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

// POST a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, userName, rating, title, content, images } = body

    if (!productId || !userId || !userName || !rating || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if user already reviewed this product
    const { data: existing } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
    }

    const { data: review, error } = await supabaseAdmin
      .from("reviews")
      .insert([{
        product_id: productId,
        user_id: userId,
        user_name: userName,
        rating,
        title,
        content,
        images: images || [],
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creating review:", error)
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
    }

    // Update product average rating
    const { data: allReviews } = await supabaseAdmin
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
      await supabaseAdmin
        .from("products")
        .update({ rating: Math.round(avg * 10) / 10 })
        .eq("id", productId)
    }

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

// PATCH to mark a review as helpful
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId } = body

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.rpc("increment_helpful_count", { review_id: reviewId }).maybeSingle()

    // Fallback: manual increment if RPC doesn't exist
    if (error) {
      const { data: review } = await supabaseAdmin
        .from("reviews")
        .select("helpful_count")
        .eq("id", reviewId)
        .single()

      if (review) {
        await supabaseAdmin
          .from("reviews")
          .update({ helpful_count: (review.helpful_count || 0) + 1 })
          .eq("id", reviewId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

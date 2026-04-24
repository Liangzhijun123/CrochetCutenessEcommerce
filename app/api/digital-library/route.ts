import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "@/lib/supabase-admin"

// Build a user-scoped Supabase client from a Bearer token so we don't need
// the service role key for reads (RLS policy "Users can view own purchases" handles auth).
function userScopedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Prefer service-role client (if key is set) so we can join products/sellers.
    // Fall back to user-scoped client via Bearer token.
    const authHeader = request.headers.get("Authorization") || ""
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
    const db = (process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : null) ?? (bearerToken ? userScopedClient(bearerToken) : supabaseAdmin)

    // Get all purchases for this user
    const { data: purchases, error: purchaseError } = await db
      .from("purchases")
      .select("id, pattern_id, purchased_at")
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false })

    if (purchaseError) {
      console.error("[digital-library] Error fetching purchases:", purchaseError)
      return NextResponse.json({ error: "Failed to fetch purchases", details: purchaseError.message }, { status: 500 })
    }
    if (!purchases || purchases.length === 0) {
      return NextResponse.json({ purchases: [] })
    }

    // Get the products for these purchases
    const patternIds = [...new Set(purchases.map((p) => p.pattern_id))]
    const { data: products, error: productError } = await db
      .from("products")
      .select("id, title, image_url, product_type, pdf_password, seller_id")
      .in("id", patternIds)

    if (productError) {
      console.error("Error fetching products:", productError)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // Get seller info
    const sellerIds = [...new Set((products || []).map((p) => p.seller_id).filter(Boolean))]
    let sellersMap: Record<string, string> = {}
    if (sellerIds.length > 0) {
      const { data: sellers } = await db
        .from("sellers")
        .select("id, shop_name")
        .in("id", sellerIds)
      for (const s of sellers || []) {
        sellersMap[s.id] = s.shop_name
      }
    }

    // Build product lookup
    const productMap = new Map((products || []).map((p) => [p.id, p]))

    // Filter to only digital products and map to safe shape (don't expose password)
    const digitalPurchases = purchases
      .filter((p) => {
        const product = productMap.get(p.pattern_id)
        return product && (product.product_type === "pdf_pattern" || product.product_type === "both")
      })
      .map((p) => {
        const product = productMap.get(p.pattern_id)!
        return {
          id: p.id,
          product_id: p.pattern_id,
          product_title: product.title || "Unknown Pattern",
          product_image: product.image_url || null,
          seller_name: sellersMap[product.seller_id] || "Unknown Seller",
          purchased_at: p.purchased_at,
          has_password: !!product.pdf_password,
        }
      })

    return NextResponse.json({ purchases: digitalPurchases })
  } catch (error) {
    console.error("Error in digital library API:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productIds } = body as { userId: string; productIds: string[] }

    if (!userId || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "userId and productIds are required" }, { status: 400 })
    }

    const rows = productIds.map((productId) => ({
      user_id: userId,
      pattern_id: productId,
      purchased_at: new Date().toISOString(),
    }))

    // upsert so a re-purchase of the same product doesn't throw a unique-constraint error
    const { error } = await supabaseAdmin
      .from("purchases")
      .upsert(rows, { onConflict: "user_id,pattern_id", ignoreDuplicates: true })

    if (error) {
      console.error("[digital-library] Error inserting digital purchases:", error)
      return NextResponse.json({ error: "Failed to register digital purchases", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: rows.length })
  } catch (error) {
    console.error("Error in digital library POST:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

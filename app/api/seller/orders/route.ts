import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")

    // Get seller from auth cookie or query param
    let resolvedSellerId = sellerId

    if (!resolvedSellerId) {
      // Try to get from the cookie-based auth
      const authHeader = request.headers.get("cookie")
      const match = authHeader?.match(/userId=([^;]+)/)
      resolvedSellerId = match?.[1] || null
    }

    if (!resolvedSellerId) {
      return NextResponse.json({ success: false, error: "Seller ID is required" }, { status: 400 })
    }

    // Get seller record to find their products
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("*, sellers!users_seller_id_fkey(*)")
      .eq("id", resolvedSellerId)
      .single()

    if (!userData) {
      return NextResponse.json({ success: true, orders: [] })
    }

    const sellerRecord = userData.sellers

    // Get seller's product IDs
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("seller_id", sellerRecord?.id || resolvedSellerId)

    const productIds = (products || []).map((p: any) => p.id)

    if (productIds.length === 0) {
      return NextResponse.json({ success: true, orders: [] })
    }

    // Get orders that involve seller's products
    const { data: allOrders, error } = await supabaseAdmin
      .from("orders")
      .select("*, users!orders_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ success: true, orders: [] })
      }
      throw error
    }

    // Filter orders that contain this seller's products
    const sellerOrders = (allOrders || []).filter((order: any) => {
      if (!Array.isArray(order.items)) return false
      return order.items.some((item: any) =>
        productIds.includes(item.product_id) || productIds.includes(item.id)
      )
    }).map((order: any) => ({
      id: order.id,
      created_at: order.created_at,
      updated_at: order.updated_at || order.created_at,
      status: order.status || "pending",
      total: order.total || 0,
      items: Array.isArray(order.items) ? order.items : [],
      customerName: order.users?.full_name || "Customer",
      customerEmail: order.users?.email || "",
      tracking_number: order.tracking_number,
    }))

    return NextResponse.json({ success: true, orders: sellerOrders })
  } catch (error) {
    console.error("Seller orders API error:", error)
    return NextResponse.json({ success: true, orders: [] })
  }
}

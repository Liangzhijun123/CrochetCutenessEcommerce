import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 })
    }

    // Get user and their seller record
    const { data: userData, error: userErr } = await supabaseAdmin
      .from("users")
      .select("*, sellers!users_seller_id_fkey(*)")
      .eq("id", sellerId)
      .single()

    if (userErr || !userData) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }

    const sellerRecord = userData.sellers

    // Get seller's products
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("seller_id", sellerRecord?.id || sellerId)
      .order("created_at", { ascending: false })

    // Get purchases of seller's products (earnings)
    const productIds = (products || []).map((p: any) => p.id)

    let purchases: any[] = []
    if (productIds.length > 0) {
      const { data: purchaseData } = await supabaseAdmin
        .from("purchases")
        .select("*, users!purchases_user_id_fkey(full_name, email)")
        .in("pattern_id", productIds)
        .order("purchased_at", { ascending: false })
      purchases = purchaseData || []
    }

    // Get orders that involve seller's products
    const { data: allOrders } = await supabaseAdmin
      .from("orders")
      .select("*, users!orders_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })

    // Filter orders that contain this seller's products
    const sellerOrders = (allOrders || []).filter((order: any) => {
      if (!Array.isArray(order.items)) return false
      return order.items.some((item: any) =>
        productIds.includes(item.product_id) || productIds.includes(item.id)
      )
    })

    // Get seller transactions
    let transactions: any[] = []
    if (sellerRecord?.id) {
      const { data: txData } = await supabaseAdmin
        .from("seller_transactions")
        .select("*")
        .eq("seller_id", sellerRecord.id)
        .order("created_at", { ascending: false })
        .limit(50)
      transactions = txData || []
    }

    // Get seller withdrawals
    let withdrawals: any[] = []
    if (sellerRecord?.id) {
      const { data: wdData } = await supabaseAdmin
        .from("seller_withdrawals")
        .select("*")
        .eq("seller_id", sellerRecord.id)
        .order("created_at", { ascending: false })
        .limit(50)
      withdrawals = wdData || []
    }

    // Calculate earnings
    const totalEarned = purchases.reduce(
      (sum: number, p: any) => sum + (parseFloat(p.creator_commission) || parseFloat(p.amount_paid) || 0),
      0
    )
    const totalWithdrawn = withdrawals
      .filter((w: any) => w.status === "completed")
      .reduce((sum: number, w: any) => sum + (parseFloat(w.amount) || 0), 0)
    const pendingWithdrawals = withdrawals
      .filter((w: any) => w.status === "pending")
      .reduce((sum: number, w: any) => sum + (parseFloat(w.amount) || 0), 0)
    const availableBalance = totalEarned - totalWithdrawn - pendingWithdrawals

    // Build analytics summary
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentPurchases = purchases.filter(
      (p: any) => new Date(p.purchased_at) >= thirtyDaysAgo
    )
    const recentRevenue = recentPurchases.reduce(
      (sum: number, p: any) => sum + (parseFloat(p.amount_paid) || 0),
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        seller: sellerRecord,
        products: products || [],
        orders: sellerOrders.map((order: any) => ({
          id: order.id,
          customerName: order.users?.full_name || order.users?.email || "Unknown",
          customerEmail: order.users?.email || "",
          items: order.items,
          total: parseFloat(order.total) || 0,
          status: order.status,
          createdAt: order.created_at,
        })),
        purchases: purchases.map((p: any) => ({
          id: p.id,
          customerName: p.users?.full_name || p.users?.email || "Unknown",
          patternId: p.pattern_id,
          amountPaid: parseFloat(p.amount_paid) || 0,
          commission: parseFloat(p.creator_commission) || parseFloat(p.amount_paid) || 0,
          platformFee: parseFloat(p.platform_fee) || 0,
          paymentMethod: p.payment_method,
          purchasedAt: p.purchased_at,
        })),
        earnings: {
          availableBalance: Math.max(0, availableBalance),
          pendingEarnings: pendingWithdrawals,
          totalEarned,
        },
        transactions,
        withdrawals: withdrawals.map((w: any) => ({
          id: w.id,
          amount: parseFloat(w.amount) || 0,
          method: w.method,
          status: w.status,
          createdAt: w.created_at,
          processedAt: w.processed_at,
        })),
        analytics: {
          totalSales: purchases.length,
          totalRevenue: totalEarned,
          recentRevenue,
          recentSales: recentPurchases.length,
          totalProducts: (products || []).length,
          totalViews: (products || []).reduce((sum: number, p: any) => sum + (p.views || 0), 0),
          conversionRate:
            (products || []).reduce((sum: number, p: any) => sum + (p.views || 0), 0) > 0
              ? ((purchases.length / (products || []).reduce((sum: number, p: any) => sum + (p.views || 0), 0)) * 100)
              : 0,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching seller dashboard data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Request a withdrawal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, amount } = body

    if (!sellerId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Valid seller ID and amount are required" }, { status: 400 })
    }

    // Get user and seller record
    const { data: userData, error: userErr } = await supabaseAdmin
      .from("users")
      .select("seller_id")
      .eq("id", sellerId)
      .single()

    if (userErr || !userData?.seller_id) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }

    const sellerRecordId = userData.seller_id

    // Create withdrawal record
    const { data: withdrawal, error: wdErr } = await supabaseAdmin
      .from("seller_withdrawals")
      .insert({
        seller_id: sellerRecordId,
        amount,
        method: "bank_transfer",
        status: "pending",
      })
      .select()
      .single()

    if (wdErr) {
      console.error("Error creating withdrawal:", wdErr)
      return NextResponse.json({ error: "Failed to create withdrawal" }, { status: 500 })
    }

    // Create transaction record
    await supabaseAdmin.from("seller_transactions").insert({
      seller_id: sellerRecordId,
      type: "withdrawal",
      description: "Withdrawal request to bank account",
      amount: -amount,
    })

    return NextResponse.json({
      success: true,
      withdrawal,
      message: "Withdrawal request submitted successfully",
    })
  } catch (error) {
    console.error("Error processing withdrawal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    // Fetch all users
    const { data: users, error: usersErr } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, avatar_url, role, is_seller, created_at")
      .order("created_at", { ascending: false })

    if (usersErr) throw usersErr

    const allUsers = users || []

    // Count sellers
    const totalSellers = allUsers.filter(u => u.is_seller || u.role === "seller").length

    // Count orders
    let totalOrders = 0
    let totalRevenue = 0
    try {
      const { count } = await supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
      totalOrders = count || 0

      const { data: revenueData } = await supabaseAdmin
        .from("orders")
        .select("total")
      if (revenueData) {
        totalRevenue = revenueData.reduce((sum, o) => sum + Number(o.total || 0), 0)
      }
    } catch {
      // orders table may be empty
    }

    // Count leaderboard participants (users with XP)
    let leaderboardUsers = 0
    try {
      const { count } = await supabaseAdmin
        .from("user_xp")
        .select("*", { count: "exact", head: true })
      leaderboardUsers = count || 0
    } catch {
      // table may not exist
    }

    // Pending seller applications
    let pendingSellerApps = 0
    try {
      const { count } = await supabaseAdmin
        .from("seller_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
      pendingSellerApps = count || 0
    } catch {
      // no apps
    }

    // Pending pattern testing applications
    let pendingPTApps = 0
    try {
      const { count } = await supabaseAdmin
        .from("pattern_testing_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
      pendingPTApps = count || 0
    } catch {
      // no apps
    }

    return NextResponse.json({
      totalUsers: allUsers.length,
      totalSellers,
      totalOrders,
      totalRevenue,
      leaderboardUsers,
      pendingSellerApps,
      pendingPTApps,
      recentUsers: allUsers.slice(0, 5),
      allUsers,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
}

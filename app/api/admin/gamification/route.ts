import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { 
  getUsers,
  getCoinTransactions,
  getPointsTransactions,
  getDailyCoinClaims,
  createCoinTransaction,
  createPointsTransaction,
  updateUser,
  initializeDatabase 
} from "@/lib/local-storage-db"

// GET /api/admin/gamification - Get gamification overview and statistics
async function getGamificationStats(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const users = getUsers()
    const coinTransactions = getCoinTransactions()
    const pointsTransactions = getPointsTransactions()
    const dailyClaims = getDailyCoinClaims()

    // Calculate overall statistics
    const totalCoinsInCirculation = users.reduce((sum, u) => sum + (u.coins || 0), 0)
    const totalPointsInCirculation = users.reduce((sum, u) => sum + (u.points || 0), 0)
    const totalCoinsIssued = coinTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const totalPointsIssued = pointsTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    // Active users (claimed in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentClaims = dailyClaims.filter(
      c => new Date(c.claimedAt) >= sevenDaysAgo
    )
    const activeUsers = new Set(recentClaims.map(c => c.userId)).size

    // Streak statistics
    const usersWithStreaks = users.filter(u => (u.loginStreak || 0) > 0)
    const averageStreak = usersWithStreaks.length > 0
      ? usersWithStreaks.reduce((sum, u) => sum + (u.loginStreak || 0), 0) / usersWithStreaks.length
      : 0

    // Loyalty tier distribution
    const tierDistribution = users.reduce((acc, u) => {
      const tier = u.loyaltyTier || 'bronze'
      acc[tier] = (acc[tier] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Daily claim rate (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentClaimsCount = dailyClaims.filter(
      c => new Date(c.claimedAt) >= thirtyDaysAgo
    ).length
    const dailyClaimRate = recentClaimsCount / 30

    // Top users by coins
    const topCoinUsers = users
      .sort((a, b) => (b.coins || 0) - (a.coins || 0))
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        coins: u.coins || 0,
        points: u.points || 0,
        streak: u.loginStreak || 0,
        tier: u.loyaltyTier,
      }))

    // Top users by points
    const topPointUsers = users
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        coins: u.coins || 0,
        points: u.points || 0,
        streak: u.loginStreak || 0,
        tier: u.loyaltyTier,
      }))

    // Recent transactions
    const recentCoinTransactions = coinTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(t => {
        const user = users.find(u => u.id === t.userId)
        return {
          ...t,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
        }
      })

    const recentPointTransactions = pointsTransactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(t => {
        const user = users.find(u => u.id === t.userId)
        return {
          ...t,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
        }
      })

    return NextResponse.json({
      overview: {
        totalUsers: users.length,
        activeUsers,
        totalCoinsInCirculation,
        totalPointsInCirculation,
        totalCoinsIssued,
        totalPointsIssued,
        averageStreak: Math.round(averageStreak * 10) / 10,
        dailyClaimRate: Math.round(dailyClaimRate * 10) / 10,
      },
      distribution: {
        tierDistribution,
      },
      leaderboards: {
        topCoinUsers,
        topPointUsers,
      },
      recentActivity: {
        coinTransactions: recentCoinTransactions,
        pointTransactions: recentPointTransactions,
      },
    })
  } catch (error) {
    console.error("Get gamification stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/gamification - Admin actions (adjust balances, grant bonuses)
async function adminGamificationAction(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const { action, userId, amount, reason } = await request.json()

    if (!action || !userId) {
      return NextResponse.json({ error: "Action and userId are required" }, { status: 400 })
    }

    const targetUser = getUsers().find(u => u.id === userId)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let result: any = {}

    switch (action) {
      case "add_coins":
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
        }
        updateUser(userId, {
          coins: (targetUser.coins || 0) + amount,
        })
        createCoinTransaction({
          userId,
          type: "admin_adjustment",
          amount,
          description: reason || `Admin bonus: ${amount} coins`,
        })
        result = { message: `Added ${amount} coins to ${targetUser.name}` }
        break

      case "remove_coins":
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
        }
        const newCoins = Math.max(0, (targetUser.coins || 0) - amount)
        updateUser(userId, {
          coins: newCoins,
        })
        createCoinTransaction({
          userId,
          type: "admin_adjustment",
          amount: -amount,
          description: reason || `Admin adjustment: -${amount} coins`,
        })
        result = { message: `Removed ${amount} coins from ${targetUser.name}` }
        break

      case "add_points":
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
        }
        updateUser(userId, {
          points: (targetUser.points || 0) + amount,
        })
        createPointsTransaction({
          userId,
          type: "admin_adjustment",
          amount,
          description: reason || `Admin bonus: ${amount} points`,
        })
        result = { message: `Added ${amount} points to ${targetUser.name}` }
        break

      case "remove_points":
        if (!amount || amount <= 0) {
          return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
        }
        const newPoints = Math.max(0, (targetUser.points || 0) - amount)
        updateUser(userId, {
          points: newPoints,
        })
        createPointsTransaction({
          userId,
          type: "admin_adjustment",
          amount: -amount,
          description: reason || `Admin adjustment: -${amount} points`,
        })
        result = { message: `Removed ${amount} points from ${targetUser.name}` }
        break

      case "reset_streak":
        updateUser(userId, {
          loginStreak: 0,
        })
        result = { message: `Reset login streak for ${targetUser.name}` }
        break

      case "set_tier":
        const { tier } = await request.json()
        if (!["bronze", "silver", "gold", "platinum"].includes(tier)) {
          return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
        }
        updateUser(userId, {
          loyaltyTier: tier,
        })
        result = { message: `Set ${targetUser.name}'s tier to ${tier}` }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Admin gamification action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(getGamificationStats)
export const POST = withAdminAuth(adminGamificationAction)

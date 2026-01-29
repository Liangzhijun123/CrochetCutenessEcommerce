import { NextRequest, NextResponse } from "next/server"
import { withUserAuth } from "@/lib/auth-middleware"
import { getUserById, getPointsTransactionsByUser, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/points/balance - Get user's points balance and recent transactions
async function getBalance(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const currentUser = getUserById(user.userId)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const recentTransactions = getPointsTransactionsByUser(user.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10) // Get last 10 transactions

    // Calculate loyalty tier based on points
    let loyaltyTier = "bronze"
    const points = currentUser.points || 0
    
    if (points >= 1000) {
      loyaltyTier = "platinum"
    } else if (points >= 500) {
      loyaltyTier = "gold"
    } else if (points >= 200) {
      loyaltyTier = "silver"
    }

    return NextResponse.json({
      balance: points,
      loyaltyTier,
      loyaltyPoints: currentUser.loyaltyPoints || 0,
      recentTransactions,
    })
  } catch (error) {
    console.error("Get points balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withUserAuth(getBalance)
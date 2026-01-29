import { NextRequest, NextResponse } from "next/server"
import { withUserAuth } from "@/lib/auth-middleware"
import { getUserById, getCoinTransactionsByUser, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/coins/balance - Get user's coin balance and recent transactions
async function getBalance(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const currentUser = getUserById(user.userId)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const recentTransactions = getCoinTransactionsByUser(user.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10) // Get last 10 transactions

    return NextResponse.json({
      balance: currentUser.coins || 0,
      loginStreak: currentUser.loginStreak || 0,
      lastClaim: currentUser.lastCoinClaim,
      recentTransactions,
    })
  } catch (error) {
    console.error("Get coin balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withUserAuth(getBalance)
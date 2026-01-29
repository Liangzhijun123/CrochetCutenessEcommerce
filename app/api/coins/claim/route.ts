import { NextRequest, NextResponse } from "next/server"
import { withUserAuth } from "@/lib/auth-middleware"
import { claimDailyCoins, updateUserLoginStreak, initializeDatabase } from "@/lib/local-storage-db"

// POST /api/coins/claim - Claim daily coins
async function claimCoins(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    // Update login streak first
    updateUserLoginStreak(user.userId)
    
    // Attempt to claim daily coins
    const result = claimDailyCoins(user.userId)
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      coinsAwarded: result.coins,
      message: result.message,
    })
  } catch (error) {
    console.error("Claim daily coins error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withUserAuth(claimCoins)
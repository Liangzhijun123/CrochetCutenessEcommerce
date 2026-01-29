import { NextRequest, NextResponse } from "next/server"
import { withUserAuth } from "@/lib/auth-middleware"
import { getPointsTransactionsByUser, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/points/history - Get user's points transaction history
async function getHistory(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const transactions = getPointsTransactionsByUser(user.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      transactions,
    })
  } catch (error) {
    console.error("Get points history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withUserAuth(getHistory)
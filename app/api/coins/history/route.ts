import { NextRequest, NextResponse } from "next/server"
import { withUserAuth } from "@/lib/auth-middleware"
import { getCoinTransactionsByUser, getDailyCoinClaimsByUser, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/coins/history - Get user's coin transaction history and claim calendar
async function getHistory(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const transactions = getCoinTransactionsByUser(user.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    const claims = getDailyCoinClaimsByUser(user.userId)
    
    // Generate calendar data for current month
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    
    const calendarData = []
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const claim = claims.find(c => c.claimDate === dateStr)
      
      calendarData.push({
        date: dateStr,
        day,
        claimed: !!claim,
        coinsAwarded: claim?.coinsAwarded || 0,
      })
    }

    return NextResponse.json({
      transactions,
      claims,
      calendar: calendarData,
      currentMonth: {
        month: currentMonth,
        year: currentYear,
        name: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
    })
  } catch (error) {
    console.error("Get coin history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withUserAuth(getHistory)
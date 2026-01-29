import { type NextRequest, NextResponse } from "next/server"
import { 
  getCreatorEarningsById, 
  getCreatorTotalEarnings,
  getCreatorTransactions 
} from "@/lib/payment-db"
import { getPatternById } from "@/lib/pattern-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get("creatorId")
    const period = searchParams.get("period") || "all" // all, month, year
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString())

    if (!creatorId) {
      return NextResponse.json({ 
        error: "Creator ID is required" 
      }, { status: 400 })
    }

    // Get all earnings for the creator
    const earnings = getCreatorEarningsById(creatorId)
    const transactions = getCreatorTransactions(creatorId)

    // Filter by period if specified
    let filteredEarnings = earnings
    let filteredTransactions = transactions

    if (period === "month") {
      filteredEarnings = earnings.filter(e => {
        const date = new Date(e.createdAt)
        return date.getFullYear() === year && date.getMonth() === month - 1
      })
      filteredTransactions = transactions.filter(t => {
        const date = new Date(t.createdAt)
        return date.getFullYear() === year && date.getMonth() === month - 1
      })
    } else if (period === "year") {
      filteredEarnings = earnings.filter(e => {
        const date = new Date(e.createdAt)
        return date.getFullYear() === year
      })
      filteredTransactions = transactions.filter(t => {
        const date = new Date(t.createdAt)
        return date.getFullYear() === year
      })
    }

    // Calculate totals
    const totalEarnings = filteredEarnings.reduce((sum, e) => sum + e.netAmount, 0)
    const availableEarnings = filteredEarnings
      .filter(e => e.status === 'available')
      .reduce((sum, e) => sum + e.netAmount, 0)
    const paidEarnings = filteredEarnings
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + e.netAmount, 0)

    // Calculate sales metrics
    const totalSales = filteredTransactions.filter(t => t.status === 'succeeded').length
    const totalRevenue = filteredTransactions
      .filter(t => t.status === 'succeeded')
      .reduce((sum, t) => sum + t.amount, 0)

    // Get pattern performance
    const patternPerformance = new Map()
    filteredTransactions
      .filter(t => t.status === 'succeeded')
      .forEach(transaction => {
        const pattern = getPatternById(transaction.patternId)
        if (pattern) {
          const existing = patternPerformance.get(transaction.patternId) || {
            patternId: transaction.patternId,
            title: pattern.title,
            sales: 0,
            revenue: 0,
            earnings: 0,
          }
          existing.sales += 1
          existing.revenue += transaction.amount
          existing.earnings += transaction.creatorRevenue
          patternPerformance.set(transaction.patternId, existing)
        }
      })

    const topPatterns = Array.from(patternPerformance.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Prepare detailed earnings
    const detailedEarnings = filteredEarnings.map(earning => {
      const pattern = getPatternById(earning.patternId)
      return {
        id: earning.id,
        transactionId: earning.transactionId,
        patternId: earning.patternId,
        patternTitle: pattern?.title || 'Unknown Pattern',
        grossAmount: earning.grossAmount,
        platformFee: earning.platformFee,
        netAmount: earning.netAmount,
        status: earning.status,
        payoutDate: earning.payoutDate,
        createdAt: earning.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalEarnings: totalEarnings / 100, // Convert cents to dollars
        availableEarnings: availableEarnings / 100,
        paidEarnings: paidEarnings / 100,
        totalSales,
        totalRevenue: totalRevenue / 100,
      },
      topPatterns: topPatterns.map(p => ({
        ...p,
        revenue: p.revenue / 100,
        earnings: p.earnings / 100,
      })),
      earnings: detailedEarnings.map(e => ({
        ...e,
        grossAmount: e.grossAmount / 100,
        platformFee: e.platformFee / 100,
        netAmount: e.netAmount / 100,
      })),
      period: {
        type: period,
        year,
        month: period === "month" ? month : undefined,
      }
    })

  } catch (error) {
    console.error("Error fetching creator earnings:", error)
    return NextResponse.json({ 
      error: "An error occurred while fetching earnings data" 
    }, { status: 500 })
  }
}
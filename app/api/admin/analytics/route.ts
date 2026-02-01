import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { 
  getUsers, 
  getPurchases, 
  getPatterns,
  getCompetitionEntries,
  getMessages,
  initializeDatabase 
} from "@/lib/local-storage-db"

// GET /api/admin/analytics - Get platform analytics
async function getAnalytics(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    const users = getUsers()
    const purchases = getPurchases()
    const patterns = getPatterns()
    const entries = getCompetitionEntries()
    const messages = getMessages()
    
    // Calculate date range
    const now = new Date()
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    }
    const days = daysMap[range] || 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    // Filter data by date range
    const recentPurchases = purchases.filter(p => new Date(p.purchasedAt) >= startDate)
    const recentUsers = users.filter(u => new Date(u.createdAt) >= startDate)
    
    // Revenue calculations
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0)
    const recentRevenue = recentPurchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0)
    
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    const thisMonthRevenue = purchases
      .filter(p => new Date(p.purchasedAt) >= thisMonth)
      .reduce((sum, p) => sum + (p.amountPaid || 0), 0)
    
    const lastMonthRevenue = purchases
      .filter(p => {
        const date = new Date(p.purchasedAt)
        return date >= lastMonth && date <= lastMonthEnd
      })
      .reduce((sum, p) => sum + (p.amountPaid || 0), 0)
    
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0
    
    // Revenue by category
    const revenueByCategory = [
      { name: 'Pattern Sales', value: totalRevenue * 0.85 },
      { name: 'Platform Fees', value: totalRevenue * 0.15 },
    ]
    
    // Revenue timeline
    const revenueTimeline = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayPurchases = purchases.filter(p => 
        p.purchasedAt.startsWith(dateStr)
      )
      revenueTimeline.push({
        date: dateStr,
        revenue: dayPurchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0),
        transactions: dayPurchases.length,
      })
    }
    
    // User statistics
    const activeUsers = users.filter(u => {
      const lastLogin = u.lastLogin ? new Date(u.lastLogin) : new Date(u.createdAt)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return lastLogin >= sevenDaysAgo
    }).length
    
    const lastMonthUsers = users.filter(u => {
      const date = new Date(u.createdAt)
      return date >= lastMonth && date <= lastMonthEnd
    }).length
    
    const userGrowth = lastMonthUsers > 0
      ? ((recentUsers.length - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
      : 0
    
    // User distribution by role
    const usersByRole = [
      { name: 'Users', value: users.filter(u => u.role === 'user').length },
      { name: 'Creators', value: users.filter(u => u.role === 'creator').length },
      { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
    ]
    
    // User timeline
    const userTimeline = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayUsers = users.filter(u => u.createdAt.startsWith(dateStr))
      const dayActive = users.filter(u => {
        const lastLogin = u.lastLogin || u.createdAt
        return lastLogin.startsWith(dateStr)
      })
      userTimeline.push({
        date: dateStr,
        users: dayUsers.length,
        active: dayActive.length,
      })
    }
    
    // Sales statistics
    const todayStr = now.toISOString().split('T')[0]
    const todaySales = purchases.filter(p => p.purchasedAt.startsWith(todayStr)).length
    const averageOrderValue = purchases.length > 0
      ? totalRevenue / purchases.length
      : 0
    
    // Top patterns
    const patternSales = patterns.map(pattern => {
      const sales = purchases.filter(p => p.patternId === pattern.id)
      const revenue = sales.reduce((sum, p) => sum + (p.amountPaid || 0), 0)
      return {
        id: pattern.id,
        title: pattern.title,
        sales: sales.length,
        revenue,
      }
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    
    // Top creators
    const creatorStats = new Map()
    purchases.forEach(purchase => {
      const pattern = patterns.find(p => p.id === purchase.patternId)
      if (pattern) {
        const creatorId = pattern.creatorId
        const existing = creatorStats.get(creatorId) || { sales: 0, revenue: 0 }
        creatorStats.set(creatorId, {
          sales: existing.sales + 1,
          revenue: existing.revenue + (purchase.amountPaid || 0),
        })
      }
    })
    
    const topCreators = Array.from(creatorStats.entries())
      .map(([creatorId, stats]) => {
        const creator = users.find(u => u.id === creatorId)
        return {
          id: creatorId,
          name: creator?.name || 'Unknown',
          sales: stats.sales,
          revenue: stats.revenue,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    // Engagement statistics
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const dailyActiveUsers = users.filter(u => {
      const lastLogin = u.lastLogin ? new Date(u.lastLogin) : new Date(u.createdAt)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      return lastLogin >= oneDayAgo
    }).length
    
    const recentMessages = messages.filter(m => new Date(m.sentAt) >= sevenDaysAgo).length
    const patternViews = patterns.reduce((sum, p) => sum + (p.views || 0), 0)
    const conversionRate = users.length > 0
      ? ((purchases.length / users.length) * 100).toFixed(1)
      : 0
    
    return NextResponse.json({
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        thisMonth: Math.round(thisMonthRevenue * 100) / 100,
        lastMonth: Math.round(lastMonthRevenue * 100) / 100,
        growth: parseFloat(revenueGrowth),
        byCategory: revenueByCategory,
        timeline: revenueTimeline,
      },
      users: {
        total: users.length,
        active: activeUsers,
        new: recentUsers.length,
        growth: parseFloat(userGrowth),
        byRole: usersByRole,
        timeline: userTimeline,
      },
      sales: {
        total: purchases.length,
        thisMonth: purchases.filter(p => new Date(p.purchasedAt) >= thisMonth).length,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        topPatterns: patternSales,
        topCreators,
      },
      engagement: {
        dailyActiveUsers,
        averageSessionTime: 15, // Mock data
        competitionParticipation: entries.length,
        messagesSent: recentMessages,
        patternViews,
        conversionRate: parseFloat(conversionRate),
      },
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(getAnalytics)

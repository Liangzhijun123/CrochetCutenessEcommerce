import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { 
  getUsers, 
  getPurchases, 
  getPatterns,
  getCompetitions,
  getCompetitionEntries,
  getMessages,
  getSellerApplications,
  getPatternTestingApplications,
  getDailyCoinClaims,
  initializeDatabase 
} from "@/lib/local-storage-db"

// GET /api/admin/dashboard - Get dashboard overview statistics
async function getDashboardStats(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const users = getUsers()
    const purchases = getPurchases()
    const patterns = getPatterns()
    const competitions = getCompetitions()
    const entries = getCompetitionEntries()
    const messages = getMessages()
    const sellerApplications = getSellerApplications()
    const testingApplications = getPatternTestingApplications()
    const dailyClaims = getDailyCoinClaims()
    
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // User statistics
    const activeUsers = users.filter(u => {
      const lastLogin = u.lastLogin ? new Date(u.lastLogin) : new Date(u.createdAt)
      return lastLogin >= sevenDaysAgo
    }).length
    
    const newToday = users.filter(u => u.createdAt.startsWith(todayStr)).length
    
    const thisMonthUsers = users.filter(u => new Date(u.createdAt) >= thisMonth).length
    const lastMonthUsers = users.filter(u => {
      const date = new Date(u.createdAt)
      return date >= lastMonth && date <= lastMonthEnd
    }).length
    
    const userGrowth = lastMonthUsers > 0
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
      : 0
    
    // Revenue statistics
    const totalRevenue = purchases.reduce((sum, p) => sum + (p.amountPaid || 0), 0)
    const todayRevenue = purchases
      .filter(p => p.purchasedAt.startsWith(todayStr))
      .reduce((sum, p) => sum + (p.amountPaid || 0), 0)
    
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
    
    // Sales statistics
    const todaySales = purchases.filter(p => p.purchasedAt.startsWith(todayStr)).length
    const pendingSales = 0 // Mock data - would track pending orders
    
    // Content moderation
    const pendingPatterns = patterns.filter(p => (p.moderationStatus || 'pending') === 'pending').length
    const pendingEntries = entries.filter(e => (e.moderationStatus || 'pending') === 'pending').length
    const flaggedContent = [
      ...patterns.filter(p => p.moderationStatus === 'flagged'),
      ...entries.filter(e => e.moderationStatus === 'flagged'),
    ].length
    
    // Applications
    const pendingSeller = sellerApplications.filter(a => a.status === 'pending').length
    const pendingTesting = testingApplications.filter(a => a.status === 'pending').length
    
    // Engagement
    const activeCompetitions = competitions.filter(c => c.status === 'active').length
    const messagesLast24h = messages.filter(m => new Date(m.sentAt) >= oneDayAgo).length
    const todayClaims = dailyClaims.filter(c => c.claimDate === todayStr).length
    
    // Recent activity
    const recentActivity = []
    
    // Recent user registrations
    users
      .filter(u => new Date(u.createdAt) >= sevenDaysAgo)
      .slice(0, 3)
      .forEach(u => {
        recentActivity.push({
          id: `user-${u.id}`,
          type: 'user',
          description: `New user registered: ${u.name}`,
          timestamp: u.createdAt,
          status: 'success',
        })
      })
    
    // Recent purchases
    purchases
      .filter(p => new Date(p.purchasedAt) >= sevenDaysAgo)
      .slice(0, 3)
      .forEach(p => {
        const pattern = patterns.find(pat => pat.id === p.patternId)
        recentActivity.push({
          id: `purchase-${p.id}`,
          type: 'sale',
          description: `Pattern purchased: ${pattern?.title || 'Unknown'}`,
          timestamp: p.purchasedAt,
          status: 'success',
        })
      })
    
    // Recent patterns
    patterns
      .filter(p => new Date(p.createdAt) >= sevenDaysAgo)
      .slice(0, 2)
      .forEach(p => {
        recentActivity.push({
          id: `pattern-${p.id}`,
          type: 'pattern',
          description: `New pattern uploaded: ${p.title}`,
          timestamp: p.createdAt,
          status: p.moderationStatus === 'approved' ? 'success' : 'warning',
        })
      })
    
    // Sort by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return NextResponse.json({
      stats: {
        users: {
          total: users.length,
          active: activeUsers,
          newToday,
          growth: parseFloat(userGrowth),
        },
        revenue: {
          total: Math.round(totalRevenue * 100) / 100,
          today: Math.round(todayRevenue * 100) / 100,
          thisMonth: Math.round(thisMonthRevenue * 100) / 100,
          growth: parseFloat(revenueGrowth),
        },
        sales: {
          total: purchases.length,
          today: todaySales,
          pending: pendingSales,
        },
        content: {
          pendingPatterns,
          pendingEntries,
          flaggedContent,
        },
        applications: {
          pendingSeller,
          pendingTesting,
        },
        engagement: {
          activeCompetitions,
          messagesLast24h,
          dailyClaims: todayClaims,
        },
        recentActivity: recentActivity.slice(0, 10),
      },
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(getDashboardStats)

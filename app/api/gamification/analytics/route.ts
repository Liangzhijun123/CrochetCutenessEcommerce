import { NextRequest, NextResponse } from "next/server"
import { withUserAuth } from "@/lib/auth-middleware"
import { 
  getUserById, 
  getCoinTransactionsByUser, 
  getPointsTransactionsByUser,
  getDailyCoinClaimsByUser,
  initializeDatabase 
} from "@/lib/local-storage-db"

// GET /api/gamification/analytics - Get user's gamification analytics
async function getAnalytics(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const currentUser = getUserById(user.userId)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const coinTransactions = getCoinTransactionsByUser(user.userId)
    const pointsTransactions = getPointsTransactionsByUser(user.userId)
    const dailyClaims = getDailyCoinClaimsByUser(user.userId)

    // Calculate analytics
    const totalCoinsEarned = coinTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalCoinsSpent = Math.abs(coinTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0))
    
    const totalPointsEarned = pointsTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalPointsSpent = Math.abs(pointsTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0))

    // Calculate streak statistics
    const currentStreak = currentUser.loginStreak || 0
    const longestStreak = calculateLongestStreak(dailyClaims)
    const totalDaysClaimed = dailyClaims.length
    
    // Calculate monthly activity
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const recentCoinTransactions = coinTransactions.filter(
      t => new Date(t.createdAt) >= thirtyDaysAgo
    )
    const recentPointsTransactions = pointsTransactions.filter(
      t => new Date(t.createdAt) >= thirtyDaysAgo
    )

    // Calculate engagement score (0-100)
    const engagementScore = calculateEngagementScore({
      currentStreak,
      totalDaysClaimed,
      totalCoinsEarned,
      totalPointsEarned,
      recentActivity: recentCoinTransactions.length + recentPointsTransactions.length,
    })

    // Calculate daily activity chart data (last 30 days)
    const dailyActivity = generateDailyActivityData(
      coinTransactions,
      pointsTransactions,
      dailyClaims,
      30
    )

    // Calculate transaction type breakdown
    const coinsByType = calculateTransactionsByType(coinTransactions)
    const pointsByType = calculateTransactionsByType(pointsTransactions)

    return NextResponse.json({
      summary: {
        currentCoins: currentUser.coins || 0,
        currentPoints: currentUser.points || 0,
        totalCoinsEarned,
        totalCoinsSpent,
        totalPointsEarned,
        totalPointsSpent,
        currentStreak,
        longestStreak,
        totalDaysClaimed,
        engagementScore,
        loyaltyTier: currentUser.loyaltyTier,
      },
      activity: {
        daily: dailyActivity,
        coinsByType,
        pointsByType,
      },
      milestones: calculateMilestones({
        totalDaysClaimed,
        currentStreak,
        longestStreak,
        totalCoinsEarned,
        totalPointsEarned,
      }),
    })
  } catch (error) {
    console.error("Get gamification analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateLongestStreak(claims: any[]): number {
  if (claims.length === 0) return 0
  
  const sortedClaims = claims
    .map(c => c.claimDate)
    .sort()
  
  let longestStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < sortedClaims.length; i++) {
    const prevDate = new Date(sortedClaims[i - 1])
    const currDate = new Date(sortedClaims[i])
    const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return longestStreak
}

function calculateEngagementScore(data: {
  currentStreak: number
  totalDaysClaimed: number
  totalCoinsEarned: number
  totalPointsEarned: number
  recentActivity: number
}): number {
  // Weighted scoring system
  const streakScore = Math.min((data.currentStreak / 30) * 30, 30) // Max 30 points
  const claimScore = Math.min((data.totalDaysClaimed / 100) * 20, 20) // Max 20 points
  const coinsScore = Math.min((data.totalCoinsEarned / 500) * 20, 20) // Max 20 points
  const pointsScore = Math.min((data.totalPointsEarned / 1000) * 20, 20) // Max 20 points
  const activityScore = Math.min((data.recentActivity / 50) * 10, 10) // Max 10 points
  
  return Math.round(streakScore + claimScore + coinsScore + pointsScore + activityScore)
}

function generateDailyActivityData(
  coinTransactions: any[],
  pointsTransactions: any[],
  dailyClaims: any[],
  days: number
): any[] {
  const result = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const coinsEarned = coinTransactions
      .filter(t => t.createdAt.startsWith(dateStr) && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const pointsEarned = pointsTransactions
      .filter(t => t.createdAt.startsWith(dateStr) && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const claimed = dailyClaims.some(c => c.claimDate === dateStr)
    
    result.push({
      date: dateStr,
      coinsEarned,
      pointsEarned,
      claimed,
    })
  }
  
  return result
}

function calculateTransactionsByType(transactions: any[]): Record<string, number> {
  const result: Record<string, number> = {}
  
  transactions.forEach(t => {
    if (!result[t.type]) {
      result[t.type] = 0
    }
    result[t.type] += Math.abs(t.amount)
  })
  
  return result
}

function calculateMilestones(data: {
  totalDaysClaimed: number
  currentStreak: number
  longestStreak: number
  totalCoinsEarned: number
  totalPointsEarned: number
}): any[] {
  const milestones = []
  
  // Streak milestones
  const streakMilestones = [7, 14, 30, 60, 100]
  streakMilestones.forEach(target => {
    milestones.push({
      id: `streak_${target}`,
      title: `${target} Day Streak`,
      description: `Maintain a ${target} day login streak`,
      type: 'streak',
      target,
      current: data.currentStreak,
      completed: data.longestStreak >= target,
      progress: Math.min((data.currentStreak / target) * 100, 100),
    })
  })
  
  // Claim milestones
  const claimMilestones = [10, 30, 60, 100, 365]
  claimMilestones.forEach(target => {
    milestones.push({
      id: `claims_${target}`,
      title: `${target} Days Claimed`,
      description: `Claim daily coins ${target} times`,
      type: 'claims',
      target,
      current: data.totalDaysClaimed,
      completed: data.totalDaysClaimed >= target,
      progress: Math.min((data.totalDaysClaimed / target) * 100, 100),
    })
  })
  
  // Coin milestones
  const coinMilestones = [100, 500, 1000, 5000]
  coinMilestones.forEach(target => {
    milestones.push({
      id: `coins_${target}`,
      title: `${target} Coins Earned`,
      description: `Earn a total of ${target} coins`,
      type: 'coins',
      target,
      current: data.totalCoinsEarned,
      completed: data.totalCoinsEarned >= target,
      progress: Math.min((data.totalCoinsEarned / target) * 100, 100),
    })
  })
  
  // Points milestones
  const pointsMilestones = [100, 500, 1000, 5000]
  pointsMilestones.forEach(target => {
    milestones.push({
      id: `points_${target}`,
      title: `${target} Points Earned`,
      description: `Earn a total of ${target} points`,
      type: 'points',
      target,
      current: data.totalPointsEarned,
      completed: data.totalPointsEarned >= target,
      progress: Math.min((data.totalPointsEarned / target) * 100, 100),
    })
  })
  
  return milestones
}

export const GET = withUserAuth(getAnalytics)

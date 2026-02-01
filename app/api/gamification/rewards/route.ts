import { NextRequest, NextResponse } from "next/server"
import { withUserAuth } from "@/lib/auth-middleware"
import { 
  getUserById, 
  updateUser,
  createCoinTransaction,
  createPointsTransaction,
  initializeDatabase 
} from "@/lib/local-storage-db"

// Reward definitions
const REWARDS = [
  {
    id: "discount_5",
    name: "$5 Discount",
    description: "Get $5 off your next order",
    type: "discount",
    cost: 100,
    costType: "points",
    value: 5,
    icon: "💰",
  },
  {
    id: "discount_10",
    name: "$10 Discount",
    description: "Get $10 off your next order",
    type: "discount",
    cost: 200,
    costType: "points",
    value: 10,
    icon: "💵",
  },
  {
    id: "free_shipping",
    name: "Free Shipping",
    description: "Free shipping on your next order",
    type: "shipping",
    cost: 50,
    costType: "points",
    value: 0,
    icon: "📦",
  },
  {
    id: "exclusive_pattern",
    name: "Exclusive Pattern",
    description: "Unlock a premium designer pattern",
    type: "pattern",
    cost: 200,
    costType: "points",
    value: 0,
    icon: "🧶",
  },
  {
    id: "vip_support",
    name: "VIP Support",
    description: "Get priority customer service for 30 days",
    type: "service",
    cost: 300,
    costType: "points",
    value: 0,
    icon: "👑",
  },
  {
    id: "coin_pack_small",
    name: "Small Coin Pack",
    description: "Get 50 bonus coins",
    type: "coins",
    cost: 100,
    costType: "points",
    value: 50,
    icon: "🪙",
  },
  {
    id: "coin_pack_medium",
    name: "Medium Coin Pack",
    description: "Get 150 bonus coins",
    type: "coins",
    cost: 250,
    costType: "points",
    value: 150,
    icon: "💰",
  },
  {
    id: "coin_pack_large",
    name: "Large Coin Pack",
    description: "Get 400 bonus coins",
    type: "coins",
    cost: 500,
    costType: "points",
    value: 400,
    icon: "💎",
  },
]

// GET /api/gamification/rewards - Get available rewards
async function getRewards(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const currentUser = getUserById(user.userId)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Add affordability info to each reward
    const rewardsWithStatus = REWARDS.map(reward => ({
      ...reward,
      canAfford: reward.costType === "points" 
        ? (currentUser.points || 0) >= reward.cost
        : (currentUser.coins || 0) >= reward.cost,
      userBalance: reward.costType === "points" 
        ? currentUser.points || 0
        : currentUser.coins || 0,
    }))

    return NextResponse.json({
      rewards: rewardsWithStatus,
      userBalance: {
        coins: currentUser.coins || 0,
        points: currentUser.points || 0,
      },
    })
  } catch (error) {
    console.error("Get rewards error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/gamification/rewards - Redeem a reward
async function redeemReward(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const { rewardId } = await request.json()
    
    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 })
    }

    const reward = REWARDS.find(r => r.id === rewardId)
    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 })
    }

    const currentUser = getUserById(user.userId)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user can afford the reward
    const currentBalance = reward.costType === "points" 
      ? currentUser.points || 0
      : currentUser.coins || 0

    if (currentBalance < reward.cost) {
      return NextResponse.json({ 
        error: `Insufficient ${reward.costType}. You need ${reward.cost} but have ${currentBalance}` 
      }, { status: 400 })
    }

    // Deduct the cost
    if (reward.costType === "points") {
      updateUser(user.userId, {
        points: currentBalance - reward.cost,
      })
      
      createPointsTransaction({
        userId: user.userId,
        type: "admin_adjustment",
        amount: -reward.cost,
        description: `Redeemed reward: ${reward.name}`,
      })
    } else {
      updateUser(user.userId, {
        coins: currentBalance - reward.cost,
      })
      
      createCoinTransaction({
        userId: user.userId,
        type: "admin_adjustment",
        amount: -reward.cost,
        description: `Redeemed reward: ${reward.name}`,
      })
    }

    // Apply the reward benefit
    let rewardData: any = {
      rewardId: reward.id,
      redeemedAt: new Date().toISOString(),
    }

    if (reward.type === "coins") {
      // Add bonus coins
      const newCoins = (currentUser.coins || 0) + reward.value
      updateUser(user.userId, {
        coins: newCoins,
      })
      
      createCoinTransaction({
        userId: user.userId,
        type: "purchase_bonus",
        amount: reward.value,
        description: `Bonus coins from reward: ${reward.name}`,
      })
      
      rewardData.coinsAdded = reward.value
    }

    // In a real app, you would:
    // - Create a discount code for discount rewards
    // - Grant access to exclusive patterns
    // - Enable VIP support features
    // - etc.

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${reward.name}!`,
      reward: {
        ...reward,
        ...rewardData,
      },
      newBalance: {
        coins: currentUser.coins || 0,
        points: currentUser.points || 0,
      },
    })
  } catch (error) {
    console.error("Redeem reward error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withUserAuth(getRewards)
export const POST = withUserAuth(redeemReward)

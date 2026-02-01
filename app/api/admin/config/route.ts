import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"

// Default system configuration
const DEFAULT_CONFIG = {
  coins: {
    dailyClaimAmount: 10,
    streakBonusEnabled: true,
    streakBonusAmount: 5,
    streakBonusThreshold: 7,
    purchaseBonusEnabled: true,
    purchaseBonusRate: 1,
  },
  points: {
    purchasePointsRate: 10,
    tierThresholds: {
      bronze: 0,
      silver: 100,
      gold: 500,
      platinum: 1000,
    },
    tierBenefits: {
      bronze: { discount: 0 },
      silver: { discount: 5 },
      gold: { discount: 10 },
      platinum: { discount: 15 },
    },
  },
  competitions: {
    maxEntriesPerUser: 3,
    votingEnabled: true,
    autoSelectWinner: false,
    entryFee: 0,
    minPrizeValue: 25,
  },
  platform: {
    commissionRate: 15,
    minPatternPrice: 1.99,
    maxPatternPrice: 99.99,
    maintenanceMode: false,
    registrationEnabled: true,
    sellerApplicationsEnabled: true,
  },
}

// GET /api/admin/config - Get system configuration
async function getConfig(request: NextRequest, user: any) {
  try {
    // In a real app, this would be stored in a database
    // For now, we'll use localStorage on the client or return defaults
    const config = DEFAULT_CONFIG
    
    return NextResponse.json({
      config,
    })
  } catch (error) {
    console.error("Get config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/config - Update system configuration
async function updateConfig(request: NextRequest, user: any) {
  try {
    const { config } = await request.json()
    
    if (!config) {
      return NextResponse.json({ error: "Configuration is required" }, { status: 400 })
    }
    
    // Validate configuration
    if (config.coins) {
      if (config.coins.dailyClaimAmount < 0) {
        return NextResponse.json({ error: "Daily claim amount must be positive" }, { status: 400 })
      }
    }
    
    if (config.platform) {
      if (config.platform.commissionRate < 0 || config.platform.commissionRate > 100) {
        return NextResponse.json({ error: "Commission rate must be between 0 and 100" }, { status: 400 })
      }
      if (config.platform.minPatternPrice < 0) {
        return NextResponse.json({ error: "Minimum pattern price must be positive" }, { status: 400 })
      }
      if (config.platform.maxPatternPrice < config.platform.minPatternPrice) {
        return NextResponse.json({ error: "Maximum price must be greater than minimum price" }, { status: 400 })
      }
    }
    
    // In a real app, save to database
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully",
      config,
    })
  } catch (error) {
    console.error("Update config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(getConfig)
export const PUT = withAdminAuth(updateConfig)

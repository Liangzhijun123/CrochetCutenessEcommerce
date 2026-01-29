import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { getUserById, updateUser, createCoinTransaction, createPointsTransaction, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/admin/users/[id] - Get specific user details
async function getUser(request: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    initializeDatabase()
    
    const targetUser = getUserById(params.id)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password, ...safeUser } = targetUser
    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user account status and details
async function updateUserAccount(request: NextRequest, user: any, { params }: { params: { id: string } }) {
  try {
    initializeDatabase()
    
    const targetUser = getUserById(params.id)
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updates = await request.json()
    
    // Validate allowed updates for admin
    const allowedUpdates: any = {}
    
    if (updates.isActive !== undefined) {
      allowedUpdates.isActive = updates.isActive
    }
    
    if (updates.role && ['user', 'creator', 'admin'].includes(updates.role)) {
      allowedUpdates.role = updates.role
    }
    
    // Admin can adjust coins and points
    if (updates.coinAdjustment !== undefined) {
      const adjustment = parseInt(updates.coinAdjustment)
      if (!isNaN(adjustment) && adjustment !== 0) {
        allowedUpdates.coins = Math.max(0, (targetUser.coins || 0) + adjustment)
        
        // Create transaction record
        createCoinTransaction({
          userId: params.id,
          type: "admin_adjustment",
          amount: adjustment,
          description: updates.coinAdjustmentReason || "Admin adjustment",
        })
      }
    }
    
    if (updates.pointsAdjustment !== undefined) {
      const adjustment = parseInt(updates.pointsAdjustment)
      if (!isNaN(adjustment) && adjustment !== 0) {
        allowedUpdates.points = Math.max(0, (targetUser.points || 0) + adjustment)
        
        // Create transaction record
        createPointsTransaction({
          userId: params.id,
          type: "admin_adjustment",
          amount: adjustment,
          description: updates.pointsAdjustmentReason || "Admin adjustment",
        })
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
    }

    const updatedUser = updateUser(params.id, allowedUpdates)
    const { password, ...safeUser } = updatedUser
    
    return NextResponse.json({ 
      user: safeUser,
      message: "User updated successfully" 
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(getUser)
export const PUT = withAdminAuth(updateUserAccount)
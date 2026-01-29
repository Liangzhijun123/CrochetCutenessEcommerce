import { NextRequest, NextResponse } from "next/server"
import { withUserAuth } from "@/lib/auth-middleware"
import { getUserById, updateUser, updateUserLoginStreak, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/auth/profile - Get current user profile
async function getProfile(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const currentUser = getUserById(user.userId)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update login streak on profile access
    updateUserLoginStreak(user.userId)
    
    // Get updated user data after login streak update
    const updatedUser = getUserById(user.userId)
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password: _, ...userWithoutPassword } = updatedUser as any
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/auth/profile - Update current user profile
async function updateProfile(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const updates = await request.json()
    
    // Prevent updating sensitive fields
    const allowedUpdates = {
      name: updates.name,
      avatar: updates.avatar,
    }

    // Remove undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    )

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
    }

    const updatedUser = updateUser(user.userId, filteredUpdates)
    const { password: _, ...userWithoutPassword } = updatedUser as any
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: "Profile updated successfully" 
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withUserAuth(getProfile)
export const PUT = withUserAuth(updateProfile)
import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { getUsers, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/admin/users - Get all users for admin management
async function getAdminUsers(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    
    let users = getUsers()
    
    // Filter by search term
    if (search) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Filter by role
    if (role) {
      users = users.filter(u => u.role === role)
    }
    
    // Filter by status
    if (status) {
      const isActive = status === 'active'
      users = users.filter(u => u.isActive === isActive)
    }
    
    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Paginate
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = users.slice(startIndex, endIndex)
    
    // Remove passwords from response
    const safeUsers = paginatedUsers.map(({ password, ...user }) => user)
    
    return NextResponse.json({
      users: safeUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      }
    })
  } catch (error) {
    console.error("Get admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(getAdminUsers)
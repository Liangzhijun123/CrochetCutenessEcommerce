import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, initializeDatabase } from "@/lib/local-storage-db"

// Mock database for demo purposes (fallback for initial testing)
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "user@example.com",
    password: "password123",
    role: "user",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Seller Account",
    email: "seller@example.com",
    password: "password123",
    role: "seller",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
]

export async function POST(request: NextRequest) {
  try {
    // Initialize database (load from files on first request)
    console.log("\\n[LOGIN] ========== LOGIN REQUEST RECEIVED ==========")
    console.log("[LOGIN] Initializing database...")
    initializeDatabase()
    console.log("[LOGIN] Database initialized")

    const { email, password } = await request.json()
    console.log(`[LOGIN] Email: ${email}`)
    console.log(`[LOGIN] Password length: ${password?.length || 0}`)

    if (!email || !password) {
      console.log("[LOGIN] ❌ Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Try to get user from local-storage-db first (registered users from file)
    console.log("[LOGIN] Looking up user in database...")
    let user = getUserByEmail(email)
    console.log(`[LOGIN] User lookup: ${user ? "✅ Found" : "❌ Not found"}`)

    // Fallback to mock users if not found (for testing)
    if (!user) {
      const mockUser = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (mockUser) {
        console.log(`[LOGIN] Using mock user`)
        user = mockUser as any
      }
    }

    if (!user) {
      console.log(`[LOGIN] ❌ User not found for email: ${email}`)
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Check password
    if (user.password !== password) {
      console.log(`[LOGIN] ❌ Invalid password for user: ${email}`)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    console.log(`[LOGIN] ✅ Login successful - User: ${email}, ID: ${user.id}, Role: ${user.role}`)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    console.log("[LOGIN] ✅ Returning user data")
    console.log("[LOGIN] ========== LOGIN SUCCESSFUL ==========\\n")

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("[LOGIN] ❌ Error:", error)
    console.log("[LOGIN] ========== LOGIN FAILED ==========\\n")
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

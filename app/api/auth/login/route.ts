import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, initializeDatabase } from "@/lib/local-storage-db"
import { verifyPassword, generateToken } from "@/lib/auth"

// Mock users with hashed passwords for demo purposes
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "user@example.com",
    // password: "password123" (hashed)
    password: "$2a$12$LQv3c1yqBwEHFl.9UO/OVeXxx/4X.LrhXxyD9Y/ISRN4kYpTvJ.HO",
    role: "user",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Seller Account",
    email: "seller@example.com",
    // password: "password123" (hashed)
    password: "$2a$12$LQv3c1yqBwEHFl.9UO/OVeXxx/4X.LrhXxyD9Y/ISRN4kYpTvJ.HO",
    role: "creator",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    // password: "password123" (hashed)
    password: "$2a$12$LQv3c1yqBwEHFl.9UO/OVeXxx/4X.LrhXxyD9Y/ISRN4kYpTvJ.HO",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
]

export async function POST(request: NextRequest) {
  try {
    console.log("\n[LOGIN] ========== LOGIN REQUEST RECEIVED ==========")
    console.log("[LOGIN] Initializing database...")
    initializeDatabase()
    console.log("[LOGIN] Database initialized")

    const { email, password } = await request.json()
    console.log(`[LOGIN] Email: ${email}`)
    console.log(`[LOGIN] Password provided: ${!!password}`)

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
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password using bcrypt
    console.log("[LOGIN] Verifying password...")
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      console.log(`[LOGIN] ❌ Invalid password for user: ${email}`)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log(`[LOGIN] ✅ Password verified for user: ${email}`)

    // Generate JWT token
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'creator' | 'admin'
    }

    const token = generateToken(authUser)
    console.log(`[LOGIN] ✅ JWT token generated`)

    console.log(`[LOGIN] ✅ Login successful - User: ${email}, ID: ${user.id}, Role: ${user.role}`)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    console.log("[LOGIN] ✅ Returning user data with token")
    console.log("[LOGIN] ========== LOGIN SUCCESSFUL ==========\n")

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("[LOGIN] ❌ Error:", error)
    console.log("[LOGIN] ========== LOGIN FAILED ==========\n")
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

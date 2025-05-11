import { type NextRequest, NextResponse } from "next/server"

// Mock database for demo purposes
const users = [
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

// Helper function to get user by email
function getUserByEmail(email: string) {
  return users.find((user) => user.email === email) || null
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Check password
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Save user to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("crochet_user", JSON.stringify(userWithoutPassword))
    }

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

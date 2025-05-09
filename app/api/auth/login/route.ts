import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = db.getUserByEmail(email)

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

      // Also update users array if it exists
      const usersJson = localStorage.getItem("crochet_users")
      if (usersJson) {
        const users = JSON.parse(usersJson)
        const userIndex = users.findIndex((u: any) => u.id === user.id)
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], lastLogin: new Date().toISOString() }
          localStorage.setItem("crochet_users", JSON.stringify(users))
        }
      }
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

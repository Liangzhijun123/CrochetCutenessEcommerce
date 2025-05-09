import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = db.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    // Create new user
    const newUser = db.createUser({
      name,
      email,
      password,
      role: role || "user",
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    // Save user to localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("crochet_user", JSON.stringify(userWithoutPassword))

      // Also update users array
      const usersJson = localStorage.getItem("crochet_users")
      const users = usersJson ? JSON.parse(usersJson) : []
      users.push(newUser)
      localStorage.setItem("crochet_users", JSON.stringify(users))
    }

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Registration successful",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}

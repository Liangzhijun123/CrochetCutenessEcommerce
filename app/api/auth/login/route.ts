import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Log the login attempt for debugging
    console.log(`Login attempt: ${email}`)

    const user = db.getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: `No user found with email: ${email}` }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // In a real app, you would use a proper authentication system
    // with JWT tokens, cookies, etc.
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

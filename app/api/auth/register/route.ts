import { type NextRequest, NextResponse } from "next/server"
import { createUser, initializeDatabase } from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    // Initialize database (load from files on first request)
    console.log("\n[REGISTER] ========== REGISTRATION REQUEST RECEIVED ==========")
    console.log("[REGISTER] Initializing database...")
    initializeDatabase()
    console.log("[REGISTER] Database initialized")

    const { name, email, password, role } = await request.json()
    console.log(`[REGISTER] Input: name="${name}", email="${email}", role="${role}", passwordLength=${password?.length || 0}`)

    if (!name || !email || !password || !role) {
      console.log("[REGISTER] ❌ Missing required fields")
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate role
    if (!["user", "seller", "admin"].includes(role)) {
      console.log(`[REGISTER] ❌ Invalid role: ${role}`)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    try {
      // Create a new user using the database function
      console.log("[REGISTER] Calling createUser()...")
      const newUser = createUser({
        name,
        email,
        password,
        role,
      })

      console.log(`[REGISTER] ✅ User created successfully: ${email}, ID: ${newUser.id}`)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser
      console.log("[REGISTER] Returning response without password")
      console.log("[REGISTER] ========== REGISTRATION SUCCESSFUL ==========\n")

      return NextResponse.json({
        user: userWithoutPassword,
        message: "Registration successful",
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes("Email already exists")) {
        console.log(`[REGISTER] ❌ Email already exists: ${email}`)
        return NextResponse.json({ error: "Email already exists" }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("[REGISTER] ❌ Error:", error)
    console.log("[REGISTER] ========== REGISTRATION FAILED ==========\n")
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}

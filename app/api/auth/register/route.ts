import { type NextRequest, NextResponse } from "next/server"
import { createUser, initializeDatabase } from "@/lib/local-storage-db"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
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

    // Validate role - convert 'seller' to 'creator' for consistency
    let validatedRole = role
    if (role === 'seller') {
      validatedRole = 'creator'
    }
    
    if (!["user", "creator", "admin"].includes(validatedRole)) {
      console.log(`[REGISTER] ❌ Invalid role: ${role}`)
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      console.log("[REGISTER] ❌ Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    try {
      // Hash the password
      console.log("[REGISTER] Hashing password...")
      const hashedPassword = await hashPassword(password)
      console.log("[REGISTER] ✅ Password hashed successfully")

      // Create a new user using the database function
      console.log("[REGISTER] Calling createUser()...")
      const newUser = createUser({
        name,
        email,
        password: hashedPassword,
        role: validatedRole,
      })

      console.log(`[REGISTER] ✅ User created successfully: ${email}, ID: ${newUser.id}`)

      // Generate JWT token for immediate login
      const authUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role as 'user' | 'creator' | 'admin'
      }

      const token = generateToken(authUser)
      console.log(`[REGISTER] ✅ JWT token generated`)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser
      console.log("[REGISTER] Returning response without password")
      console.log("[REGISTER] ========== REGISTRATION SUCCESSFUL ==========\n")

      return NextResponse.json({
        user: userWithoutPassword,
        token,
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

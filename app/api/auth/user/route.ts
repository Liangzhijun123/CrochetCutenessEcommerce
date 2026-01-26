import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, getUserById } from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    console.log("\n[AUTH-USER] Request received to fetch user")
    initializeDatabase()

    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { password: _, ...userWithoutPassword } = user as any
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("[AUTH-USER] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

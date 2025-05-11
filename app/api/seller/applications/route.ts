import { type NextRequest, NextResponse } from "next/server"
import { getSellerApplications, getSellerApplicationByUserId } from "@/lib/local-storage-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (userId) {
      const application = getSellerApplicationByUserId(userId)
      return NextResponse.json({ application })
    }

    const applications = getSellerApplications()
    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching seller applications:", error)
    return NextResponse.json({ error: "An error occurred while fetching applications" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import {
  getAdPerformanceMetrics,
  getAdvertiserPerformanceMetrics,
  getPlatformAdRevenue,
} from "@/lib/advertisement-db"

// GET /api/advertisements/analytics - Get advertisement analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adId = searchParams.get("adId")
    const advertiserId = searchParams.get("advertiserId")
    const platform = searchParams.get("platform") === "true"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Get specific ad performance
    if (adId) {
      const metrics = getAdPerformanceMetrics(adId)
      
      if (!metrics) {
        return NextResponse.json(
          { error: "Advertisement not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ metrics })
    }

    // Get advertiser performance
    if (advertiserId) {
      const metrics = getAdvertiserPerformanceMetrics(advertiserId)
      
      if (!metrics) {
        return NextResponse.json(
          { error: "Advertiser not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ metrics })
    }

    // Get platform-wide ad revenue
    if (platform) {
      const start = startDate ? new Date(startDate) : undefined
      const end = endDate ? new Date(endDate) : undefined
      
      const revenue = getPlatformAdRevenue(start, end)

      return NextResponse.json({ revenue })
    }

    return NextResponse.json(
      { error: "Please specify adId, advertiserId, or platform=true" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error fetching advertisement analytics:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching analytics" },
      { status: 500 }
    )
  }
}

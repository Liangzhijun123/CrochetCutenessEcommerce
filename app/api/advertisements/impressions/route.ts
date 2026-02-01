import { type NextRequest, NextResponse } from "next/server"
import { createAdImpression, getAdImpressionsByAd } from "@/lib/advertisement-db"

// POST /api/advertisements/impressions - Track an ad impression
export async function POST(request: NextRequest) {
  try {
    const impressionData = await request.json()

    // Validate required fields
    if (!impressionData.adId || !impressionData.sessionId || !impressionData.placement) {
      return NextResponse.json(
        { error: "adId, sessionId, and placement are required" },
        { status: 400 }
      )
    }

    const impression = createAdImpression({
      adId: impressionData.adId,
      userId: impressionData.userId,
      sessionId: impressionData.sessionId,
      placement: impressionData.placement,
      userAgent: impressionData.userAgent,
      ipAddress: impressionData.ipAddress,
    })

    return NextResponse.json({ impression }, { status: 201 })
  } catch (error) {
    console.error("Error creating ad impression:", error)
    return NextResponse.json(
      { error: "An error occurred while tracking the impression" },
      { status: 500 }
    )
  }
}

// GET /api/advertisements/impressions?adId=xxx - Get impressions for an ad
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adId = searchParams.get("adId")

    if (!adId) {
      return NextResponse.json(
        { error: "adId is required" },
        { status: 400 }
      )
    }

    const impressions = getAdImpressionsByAd(adId)

    return NextResponse.json({
      impressions,
      total: impressions.length,
    })
  } catch (error) {
    console.error("Error fetching ad impressions:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching impressions" },
      { status: 500 }
    )
  }
}

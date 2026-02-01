import { type NextRequest, NextResponse } from "next/server"
import { createAdClick, getAdClicksByAd } from "@/lib/advertisement-db"

// POST /api/advertisements/clicks - Track an ad click
export async function POST(request: NextRequest) {
  try {
    const clickData = await request.json()

    // Validate required fields
    if (!clickData.adId || !clickData.impressionId || !clickData.sessionId || !clickData.clickUrl) {
      return NextResponse.json(
        { error: "adId, impressionId, sessionId, and clickUrl are required" },
        { status: 400 }
      )
    }

    const click = createAdClick({
      adId: clickData.adId,
      impressionId: clickData.impressionId,
      userId: clickData.userId,
      sessionId: clickData.sessionId,
      clickUrl: clickData.clickUrl,
    })

    return NextResponse.json({ click }, { status: 201 })
  } catch (error) {
    console.error("Error creating ad click:", error)
    return NextResponse.json(
      { error: "An error occurred while tracking the click" },
      { status: 500 }
    )
  }
}

// GET /api/advertisements/clicks?adId=xxx - Get clicks for an ad
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

    const clicks = getAdClicksByAd(adId)

    return NextResponse.json({
      clicks,
      total: clicks.length,
    })
  } catch (error) {
    console.error("Error fetching ad clicks:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching clicks" },
      { status: 500 }
    )
  }
}

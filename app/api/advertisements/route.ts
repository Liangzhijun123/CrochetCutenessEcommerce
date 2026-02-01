import { type NextRequest, NextResponse } from "next/server"
import {
  getAdvertisements,
  getActiveAdvertisements,
  createAdvertisement,
  getAdvertisementsByAdvertiser,
} from "@/lib/advertisement-db"
import { getUserById } from "@/lib/local-storage-db"

// GET /api/advertisements - Get advertisements (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placement = searchParams.get("placement")
    const advertiserId = searchParams.get("advertiserId")
    const activeOnly = searchParams.get("active") === "true"

    let advertisements

    if (activeOnly) {
      advertisements = getActiveAdvertisements(placement || undefined)
    } else if (advertiserId) {
      advertisements = getAdvertisementsByAdvertiser(advertiserId)
    } else {
      advertisements = getAdvertisements()
      
      // Filter by placement if specified
      if (placement) {
        advertisements = advertisements.filter(ad => ad.placement === placement)
      }
    }

    return NextResponse.json({
      advertisements,
      total: advertisements.length,
    })
  } catch (error) {
    console.error("Error fetching advertisements:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching advertisements" },
      { status: 500 }
    )
  }
}

// POST /api/advertisements - Create a new advertisement (Admin or Advertiser)
export async function POST(request: NextRequest) {
  try {
    const adData = await request.json()

    // Validate required fields
    const requiredFields = [
      "advertiserId",
      "title",
      "description",
      "imageUrl",
      "clickUrl",
      "adType",
      "placement",
      "budget",
      "startDate",
      "endDate",
    ]

    for (const field of requiredFields) {
      if (!adData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate dates
    const startDate = new Date(adData.startDate)
    const endDate = new Date(adData.endDate)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    // Validate budget
    if (adData.budget <= 0) {
      return NextResponse.json(
        { error: "Budget must be greater than 0" },
        { status: 400 }
      )
    }

    // Set defaults
    const advertisementToCreate = {
      ...adData,
      status: adData.status || "draft",
      priority: adData.priority || 1,
      targeting: adData.targeting || {},
    }

    const newAdvertisement = createAdvertisement(advertisementToCreate)

    return NextResponse.json(
      { advertisement: newAdvertisement },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating advertisement:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while creating the advertisement" },
      { status: 500 }
    )
  }
}

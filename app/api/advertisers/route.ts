import { type NextRequest, NextResponse } from "next/server"
import {
  getAdvertisers,
  getAdvertiserByUserId,
  createAdvertiser,
} from "@/lib/advertisement-db"

// GET /api/advertisers - Get all advertisers or by userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (userId) {
      const advertiser = getAdvertiserByUserId(userId)
      
      if (!advertiser) {
        return NextResponse.json(
          { error: "Advertiser not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ advertiser })
    }

    const advertisers = getAdvertisers()

    return NextResponse.json({
      advertisers,
      total: advertisers.length,
    })
  } catch (error) {
    console.error("Error fetching advertisers:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching advertisers" },
      { status: 500 }
    )
  }
}

// POST /api/advertisers - Create a new advertiser account
export async function POST(request: NextRequest) {
  try {
    const advertiserData = await request.json()

    // Validate required fields
    const requiredFields = [
      "userId",
      "companyName",
      "contactEmail",
      "billingAddress",
      "paymentMethod",
    ]

    for (const field of requiredFields) {
      if (!advertiserData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate billing address
    const requiredAddressFields = ["street", "city", "state", "postalCode", "country"]
    for (const field of requiredAddressFields) {
      if (!advertiserData.billingAddress[field]) {
        return NextResponse.json(
          { error: `billingAddress.${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate payment method
    if (!advertiserData.paymentMethod.type) {
      return NextResponse.json(
        { error: "paymentMethod.type is required" },
        { status: 400 }
      )
    }

    // Set default status
    const advertiserToCreate = {
      ...advertiserData,
      status: advertiserData.status || "pending_approval",
    }

    const newAdvertiser = createAdvertiser(advertiserToCreate)

    return NextResponse.json(
      { advertiser: newAdvertiser },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating advertiser:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while creating the advertiser account" },
      { status: 500 }
    )
  }
}

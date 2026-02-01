import { type NextRequest, NextResponse } from "next/server"
import {
  getAdvertiserById,
  updateAdvertiser,
} from "@/lib/advertisement-db"

// GET /api/advertisers/[id] - Get a specific advertiser
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const advertiser = getAdvertiserById(params.id)

    if (!advertiser) {
      return NextResponse.json(
        { error: "Advertiser not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ advertiser })
  } catch (error) {
    console.error("Error fetching advertiser:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching the advertiser" },
      { status: 500 }
    )
  }
}

// PUT /api/advertisers/[id] - Update an advertiser
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()

    const updatedAdvertiser = updateAdvertiser(params.id, updates)

    if (!updatedAdvertiser) {
      return NextResponse.json(
        { error: "Advertiser not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ advertiser: updatedAdvertiser })
  } catch (error) {
    console.error("Error updating advertiser:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while updating the advertiser" },
      { status: 500 }
    )
  }
}

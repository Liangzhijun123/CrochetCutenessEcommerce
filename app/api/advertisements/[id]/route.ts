import { type NextRequest, NextResponse } from "next/server"
import {
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
} from "@/lib/advertisement-db"

// GET /api/advertisements/[id] - Get a specific advertisement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const advertisement = getAdvertisementById(params.id)

    if (!advertisement) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ advertisement })
  } catch (error) {
    console.error("Error fetching advertisement:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching the advertisement" },
      { status: 500 }
    )
  }
}

// PUT /api/advertisements/[id] - Update an advertisement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()

    // Validate dates if provided
    if (updates.startDate && updates.endDate) {
      const startDate = new Date(updates.startDate)
      const endDate = new Date(updates.endDate)

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
    }

    // Validate budget if provided
    if (updates.budget !== undefined && updates.budget <= 0) {
      return NextResponse.json(
        { error: "Budget must be greater than 0" },
        { status: 400 }
      )
    }

    const updatedAdvertisement = updateAdvertisement(params.id, updates)

    if (!updatedAdvertisement) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ advertisement: updatedAdvertisement })
  } catch (error) {
    console.error("Error updating advertisement:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while updating the advertisement" },
      { status: 500 }
    )
  }
}

// DELETE /api/advertisements/[id] - Delete an advertisement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteAdvertisement(params.id)

    if (!success) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Advertisement deleted successfully" })
  } catch (error) {
    console.error("Error deleting advertisement:", error)
    return NextResponse.json(
      { error: "An error occurred while deleting the advertisement" },
      { status: 500 }
    )
  }
}

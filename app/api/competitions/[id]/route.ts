import { type NextRequest, NextResponse } from "next/server"
import {
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  getCompetitionWithDetails,
  getCompetitionStats,
} from "@/lib/competition-db"
import { getUserById } from "@/lib/local-storage-db"

// GET /api/competitions/[id] - Get competition details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get("details") === "true"
    const includeStats = searchParams.get("stats") === "true"

    if (includeDetails) {
      const details = getCompetitionWithDetails(params.id)
      if (!details) {
        return NextResponse.json(
          { error: "Competition not found" },
          { status: 404 }
        )
      }
      return NextResponse.json(details)
    }

    if (includeStats) {
      const stats = getCompetitionStats(params.id)
      if (!stats) {
        return NextResponse.json(
          { error: "Competition not found" },
          { status: 404 }
        )
      }
      return NextResponse.json(stats)
    }

    const competition = getCompetitionById(params.id)
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }

    // Include creator information
    const creator = getUserById(competition.createdBy)
    const competitionWithCreator = {
      ...competition,
      creator: creator
        ? {
            id: creator.id,
            name: creator.name,
            email: creator.email,
          }
        : null,
    }

    return NextResponse.json({ competition: competitionWithCreator })
  } catch (error) {
    console.error("Error fetching competition:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching the competition" },
      { status: 500 }
    )
  }
}

// PUT /api/competitions/[id] - Update competition (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()

    // Check if competition exists
    const existingCompetition = getCompetitionById(params.id)
    if (!existingCompetition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }

    // Verify admin authorization
    if (updates.createdBy) {
      const admin = getUserById(updates.createdBy)
      if (!admin || admin.role !== "admin") {
        return NextResponse.json(
          { error: "Only administrators can update competitions" },
          { status: 403 }
        )
      }
    }

    // Validate dates if provided
    if (updates.startDate || updates.endDate) {
      const startDate = new Date(
        updates.startDate || existingCompetition.startDate
      )
      const endDate = new Date(updates.endDate || existingCompetition.endDate)

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

    // Validate voting dates if provided
    if (updates.votingStartDate || updates.votingEndDate) {
      const votingStart = new Date(
        updates.votingStartDate || existingCompetition.votingStartDate || ""
      )
      const votingEnd = new Date(
        updates.votingEndDate || existingCompetition.votingEndDate || ""
      )

      if (votingStart && votingEnd) {
        if (isNaN(votingStart.getTime()) || isNaN(votingEnd.getTime())) {
          return NextResponse.json(
            { error: "Invalid voting date format" },
            { status: 400 }
          )
        }

        if (votingStart >= votingEnd) {
          return NextResponse.json(
            { error: "Voting end date must be after voting start date" },
            { status: 400 }
          )
        }
      }
    }

    // Prevent updating certain fields
    const protectedFields = ["id", "createdAt", "createdBy"]
    for (const field of protectedFields) {
      if (updates[field] !== undefined && field !== "createdBy") {
        delete updates[field]
      }
    }

    const updatedCompetition = updateCompetition(params.id, updates)

    return NextResponse.json({ competition: updatedCompetition })
  } catch (error) {
    console.error("Error updating competition:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while updating the competition" },
      { status: 500 }
    )
  }
}

// DELETE /api/competitions/[id] - Delete competition (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get("adminId")

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      )
    }

    // Verify admin authorization
    const admin = getUserById(adminId)
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Only administrators can delete competitions" },
        { status: 403 }
      )
    }

    // Check if competition exists
    const existingCompetition = getCompetitionById(params.id)
    if (!existingCompetition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }

    const success = deleteCompetition(params.id)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete competition" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Competition deleted successfully" })
  } catch (error) {
    console.error("Error deleting competition:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: "An error occurred while deleting the competition" },
      { status: 500 }
    )
  }
}

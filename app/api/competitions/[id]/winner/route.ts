import { type NextRequest, NextResponse } from "next/server"
import {
  selectCompetitionWinner,
  markPrizeAsDistributed,
  getCompetitionById,
} from "@/lib/competition-db"
import { getUserById } from "@/lib/local-storage-db"

// POST /api/competitions/[id]/winner - Select winner for a competition (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminId } = await request.json()

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
        { error: "Only administrators can select winners" },
        { status: 403 }
      )
    }

    // Validate competition exists
    const competition = getCompetitionById(params.id)
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }

    // Check if competition has ended
    const now = new Date()
    const endDate = new Date(competition.endDate)

    if (now < endDate) {
      return NextResponse.json(
        { error: "Competition has not ended yet" },
        { status: 400 }
      )
    }

    // Check if winner already selected
    if (competition.winnerId) {
      return NextResponse.json(
        { error: "Winner has already been selected for this competition" },
        { status: 400 }
      )
    }

    const winningEntry = selectCompetitionWinner(params.id)

    // Get winner user info
    const winner = getUserById(winningEntry.userId)

    return NextResponse.json({
      message: "Winner selected successfully",
      winner: winner
        ? {
            id: winner.id,
            name: winner.name,
            email: winner.email,
          }
        : null,
      winningEntry,
    })
  } catch (error) {
    console.error("Error selecting winner:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while selecting the winner" },
      { status: 500 }
    )
  }
}

// PUT /api/competitions/[id]/winner - Mark prize as distributed (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminId, userId } = await request.json()

    if (!adminId || !userId) {
      return NextResponse.json(
        { error: "Admin ID and User ID are required" },
        { status: 400 }
      )
    }

    // Verify admin authorization
    const admin = getUserById(adminId)
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Only administrators can mark prizes as distributed" },
        { status: 403 }
      )
    }

    // Validate competition exists
    const competition = getCompetitionById(params.id)
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }

    // Check if winner has been selected
    if (!competition.winnerId) {
      return NextResponse.json(
        { error: "Winner has not been selected yet" },
        { status: 400 }
      )
    }

    // Verify userId matches the winner
    if (competition.winnerId !== userId) {
      return NextResponse.json(
        { error: "User is not the winner of this competition" },
        { status: 400 }
      )
    }

    const participation = markPrizeAsDistributed(params.id, userId)

    return NextResponse.json({
      message: "Prize marked as distributed",
      participation,
    })
  } catch (error) {
    console.error("Error marking prize as distributed:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while marking prize as distributed" },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import {
  createCompetitionVote,
  getUserVoteForCompetition,
  getCompetitionById,
  getCompetitionEntryById,
} from "@/lib/competition-db"
import { getUserById } from "@/lib/local-storage-db"

// POST /api/competitions/[id]/vote - Vote for an entry in a competition
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voteData = await request.json()

    // Validate required fields
    const requiredFields = ["userId", "entryId"]

    for (const field of requiredFields) {
      if (!voteData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate user exists
    const user = getUserById(voteData.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate competition exists
    const competition = getCompetitionById(params.id)
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }

    // Validate entry exists
    const entry = getCompetitionEntryById(voteData.entryId)
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    // Get IP address for fraud prevention (optional)
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown"

    const voteToCreate = {
      competitionId: params.id,
      entryId: voteData.entryId,
      userId: voteData.userId,
      ipAddress,
    }

    const newVote = createCompetitionVote(voteToCreate)

    return NextResponse.json(
      {
        vote: newVote,
        message: "Vote recorded successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating vote:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while recording the vote" },
      { status: 500 }
    )
  }
}

// GET /api/competitions/[id]/vote - Check if user has voted
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const vote = getUserVoteForCompetition(userId, params.id)

    return NextResponse.json({
      hasVoted: !!vote,
      vote: vote || null,
    })
  } catch (error) {
    console.error("Error checking vote status:", error)
    return NextResponse.json(
      { error: "An error occurred while checking vote status" },
      { status: 500 }
    )
  }
}

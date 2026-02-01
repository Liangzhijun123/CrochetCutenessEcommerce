import { type NextRequest, NextResponse } from "next/server"
import {
  getUserCompetitionHistory,
  getEntriesByUser,
  getParticipationsByUser,
} from "@/lib/competition-db"
import { getUserById } from "@/lib/local-storage-db"

// GET /api/competitions/user/[userId] - Get user's competition history
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Validate user exists
    const user = getUserById(params.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const history = getUserCompetitionHistory(params.userId)
    const entries = getEntriesByUser(params.userId)
    const participations = getParticipationsByUser(params.userId)

    // Calculate statistics
    const totalCompetitions = participations.length
    const totalWins = participations.filter((p) => p.won).length
    const totalVotes = entries.reduce((sum, entry) => sum + entry.votes, 0)

    return NextResponse.json({
      history,
      statistics: {
        totalCompetitions,
        totalWins,
        totalVotes,
        totalEntries: entries.length,
      },
    })
  } catch (error) {
    console.error("Error fetching user competition history:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching competition history" },
      { status: 500 }
    )
  }
}

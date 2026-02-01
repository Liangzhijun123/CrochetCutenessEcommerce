import { type NextRequest, NextResponse } from "next/server"
import {
  getCompetitions,
  getActiveCompetitions,
  getCompetitionsByStatus,
  createCompetition,
  getCompetitionWithDetails,
} from "@/lib/competition-db"
import { getUserById } from "@/lib/local-storage-db"

// GET /api/competitions - Get all competitions or filter by status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const active = searchParams.get("active")

    let competitions

    if (active === "true") {
      competitions = getActiveCompetitions()
    } else if (status) {
      competitions = getCompetitionsByStatus(
        status as "draft" | "active" | "voting" | "completed" | "cancelled"
      )
    } else {
      competitions = getCompetitions()
    }

    // Include creator information
    const competitionsWithDetails = competitions.map((competition) => {
      const creator = getUserById(competition.createdBy)
      return {
        ...competition,
        creator: creator
          ? {
              id: creator.id,
              name: creator.name,
              email: creator.email,
            }
          : null,
      }
    })

    return NextResponse.json({
      competitions: competitionsWithDetails,
      total: competitionsWithDetails.length,
    })
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching competitions" },
      { status: 500 }
    )
  }
}

// POST /api/competitions - Create a new competition (Admin only)
export async function POST(request: NextRequest) {
  try {
    const competitionData = await request.json()

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "rules",
      "startDate",
      "endDate",
      "prizeDescription",
      "createdBy",
    ]

    for (const field of requiredFields) {
      if (!competitionData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate creator is admin
    const creator = getUserById(competitionData.createdBy)
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    if (creator.role !== "admin") {
      return NextResponse.json(
        { error: "Only administrators can create competitions" },
        { status: 403 }
      )
    }

    // Validate dates
    const startDate = new Date(competitionData.startDate)
    const endDate = new Date(competitionData.endDate)

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

    // Validate voting dates if provided
    if (competitionData.votingStartDate && competitionData.votingEndDate) {
      const votingStart = new Date(competitionData.votingStartDate)
      const votingEnd = new Date(competitionData.votingEndDate)

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

      if (votingStart < endDate) {
        return NextResponse.json(
          { error: "Voting cannot start before entry submission ends" },
          { status: 400 }
        )
      }
    }

    // Set default status
    const competitionToCreate = {
      ...competitionData,
      status: competitionData.status || "draft",
    }

    const newCompetition = createCompetition(competitionToCreate)

    return NextResponse.json(
      { competition: newCompetition },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating competition:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while creating the competition" },
      { status: 500 }
    )
  }
}

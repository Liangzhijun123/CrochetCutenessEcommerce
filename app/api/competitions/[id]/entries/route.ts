import { type NextRequest, NextResponse } from "next/server"
import {
  getEntriesByCompetition,
  createCompetitionEntry,
  getCompetitionById,
} from "@/lib/competition-db"
import { getUserById } from "@/lib/local-storage-db"

// GET /api/competitions/[id]/entries - Get all entries for a competition
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competition = getCompetitionById(params.id)
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }

    const entries = getEntriesByCompetition(params.id)

    // Include user information with each entry
    const entriesWithUsers = entries.map((entry) => {
      const user = getUserById(entry.userId)
      return {
        ...entry,
        user: user
          ? {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
            }
          : null,
      }
    })

    return NextResponse.json({
      entries: entriesWithUsers,
      total: entriesWithUsers.length,
    })
  } catch (error) {
    console.error("Error fetching competition entries:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching entries" },
      { status: 500 }
    )
  }
}

// POST /api/competitions/[id]/entries - Submit an entry to a competition
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entryData = await request.json()

    // Validate required fields
    const requiredFields = ["userId", "description", "photoUrl"]

    for (const field of requiredFields) {
      if (!entryData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate user exists
    const user = getUserById(entryData.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate photo URL
    try {
      new URL(entryData.photoUrl)
    } catch {
      return NextResponse.json(
        { error: "photoUrl must be a valid URL" },
        { status: 400 }
      )
    }

    // Validate description length
    if (entryData.description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      )
    }

    if (entryData.description.length > 1000) {
      return NextResponse.json(
        { error: "Description must not exceed 1000 characters" },
        { status: 400 }
      )
    }

    const entryToCreate = {
      competitionId: params.id,
      userId: entryData.userId,
      description: entryData.description,
      photoUrl: entryData.photoUrl,
    }

    const newEntry = createCompetitionEntry(entryToCreate)

    // Include user information in response
    const entryWithUser = {
      ...newEntry,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    }

    return NextResponse.json({ entry: entryWithUser }, { status: 201 })
  } catch (error) {
    console.error("Error creating competition entry:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "An error occurred while creating the entry" },
      { status: 500 }
    )
  }
}

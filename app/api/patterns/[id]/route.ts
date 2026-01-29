import { type NextRequest, NextResponse } from "next/server"
import { 
  getPatternById, 
  updatePattern, 
  deletePattern,
  getPatternsWithCreators,
  updatePatternLibraryAccess
} from "@/lib/pattern-db"
import { getUserById } from "@/lib/local-storage-db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pattern = getPatternById(params.id)

    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 })
    }

    // Include creator information
    const patternsWithCreators = getPatternsWithCreators([pattern])
    const patternWithCreator = patternsWithCreators[0]

    // Check if user is accessing their purchased pattern (for analytics)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (userId) {
      try {
        updatePatternLibraryAccess(userId, params.id)
      } catch (error) {
        // Ignore access tracking errors
        console.log("Access tracking error:", error)
      }
    }

    return NextResponse.json({ pattern: patternWithCreator })
  } catch (error) {
    console.error("Error fetching pattern:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching the pattern" }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    // Check if pattern exists
    const existingPattern = getPatternById(params.id)
    if (!existingPattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 })
    }

    // Verify creator authorization if creatorId is provided in updates
    if (updates.creatorId && updates.creatorId !== existingPattern.creatorId) {
      return NextResponse.json(
        { error: "Cannot change pattern creator" }, 
        { status: 403 }
      )
    }

    // Validate difficulty level if provided
    if (updates.difficultyLevel) {
      const validDifficulties = ['beginner', 'intermediate', 'advanced']
      if (!validDifficulties.includes(updates.difficultyLevel)) {
        return NextResponse.json(
          { error: "Invalid difficulty level" }, 
          { status: 400 }
        )
      }
    }

    // Validate price if provided
    if (updates.price !== undefined) {
      if (typeof updates.price !== 'number' || updates.price < 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" }, 
          { status: 400 }
        )
      }
    }

    // Validate URLs if provided
    const urlFields = ['patternFileUrl', 'tutorialVideoUrl', 'thumbnailUrl']
    for (const field of urlFields) {
      if (updates[field]) {
        try {
          new URL(updates[field])
        } catch {
          return NextResponse.json(
            { error: `${field} must be a valid URL` }, 
            { status: 400 }
          )
        }
      }
    }

    // Prevent updating certain fields
    const protectedFields = ['id', 'createdAt', 'salesCount', 'reviews', 'averageRating']
    for (const field of protectedFields) {
      if (updates[field] !== undefined) {
        delete updates[field]
      }
    }

    const updatedPattern = updatePattern(params.id, updates)

    // Include creator information in response
    const patternsWithCreators = getPatternsWithCreators([updatedPattern])
    const patternWithCreator = patternsWithCreators[0]

    return NextResponse.json({ pattern: patternWithCreator })
  } catch (error) {
    console.error("Error updating pattern:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "An error occurred while updating the pattern" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get("creatorId")

    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is required" }, 
        { status: 400 }
      )
    }

    // Check if pattern exists
    const existingPattern = getPatternById(params.id)
    if (!existingPattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 })
    }

    const success = deletePattern(params.id, creatorId)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete pattern" }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Pattern deleted successfully" })
  } catch (error) {
    console.error("Error deleting pattern:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: "An error occurred while deleting the pattern" }, 
      { status: 500 }
    )
  }
}
import { type NextRequest, NextResponse } from "next/server"
import { 
  getPatterns, 
  createPattern, 
  searchPatterns,
  getFeaturedPatterns,
  getPatternsByCategory,
  getPatternsByCreator,
  getPatternsWithCreators
} from "@/lib/pattern-db"
import { getUserById } from "@/lib/local-storage-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined
    const creatorId = searchParams.get("creatorId")
    const featured = searchParams.get("featured")

    let patterns

    if (featured === "true") {
      patterns = getFeaturedPatterns()
    } else if (category) {
      patterns = getPatternsByCategory(category)
    } else if (creatorId) {
      patterns = getPatternsByCreator(creatorId)
    } else if (query || difficulty || minPrice !== undefined || maxPrice !== undefined) {
      patterns = searchPatterns(query, {
        category: category || undefined,
        difficulty: difficulty as "beginner" | "intermediate" | "advanced" || undefined,
        minPrice,
        maxPrice,
        creatorId: creatorId || undefined
      })
    } else {
      patterns = getPatterns().filter(pattern => pattern.isActive)
    }

    // Include creator information with patterns
    const patternsWithCreators = getPatternsWithCreators(patterns)

    return NextResponse.json({ 
      patterns: patternsWithCreators,
      total: patternsWithCreators.length 
    })
  } catch (error) {
    console.error("Error fetching patterns:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching patterns" }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const patternData = await request.json()

    // Validate required fields
    const requiredFields = [
      'title', 'description', 'price', 'creatorId', 'difficultyLevel',
      'patternFileUrl', 'tutorialVideoUrl', 'thumbnailUrl', 'category'
    ]
    
    for (const field of requiredFields) {
      if (!patternData[field]) {
        return NextResponse.json(
          { error: `${field} is required` }, 
          { status: 400 }
        )
      }
    }

    // Validate creator exists and has creator role
    const creator = getUserById(patternData.creatorId)
    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" }, 
        { status: 404 }
      )
    }
    
    if (creator.role !== "creator") {
      return NextResponse.json(
        { error: "User does not have creator permissions" }, 
        { status: 403 }
      )
    }

    // Validate price
    if (typeof patternData.price !== 'number' || patternData.price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" }, 
        { status: 400 }
      )
    }

    // Validate difficulty level
    const validDifficulties = ['beginner', 'intermediate', 'advanced']
    if (!validDifficulties.includes(patternData.difficultyLevel)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" }, 
        { status: 400 }
      )
    }

    // Validate file URLs (basic URL format check)
    const urlFields = ['patternFileUrl', 'tutorialVideoUrl', 'thumbnailUrl']
    for (const field of urlFields) {
      try {
        new URL(patternData[field])
      } catch {
        return NextResponse.json(
          { error: `${field} must be a valid URL` }, 
          { status: 400 }
        )
      }
    }

    // Set default values
    const patternToCreate = {
      ...patternData,
      tags: patternData.tags || [],
      materials: patternData.materials || [],
      estimatedTime: patternData.estimatedTime || "2-3 hours",
      isActive: true,
      featured: patternData.featured || false,
    }

    const newPattern = createPattern(patternToCreate)

    // Include creator information in response
    const patternWithCreator = {
      ...newPattern,
      creator
    }

    return NextResponse.json(
      { pattern: patternWithCreator }, 
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating pattern:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "An error occurred while creating the pattern" }, 
      { status: 500 }
    )
  }
}
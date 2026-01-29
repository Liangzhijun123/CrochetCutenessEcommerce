import { type NextRequest, NextResponse } from "next/server"
import { searchPatterns, getPatternsWithCreators } from "@/lib/pattern-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Search parameters
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined
    const creatorId = searchParams.get("creatorId")
    
    // Sorting and pagination parameters
    const sortBy = searchParams.get("sortBy") || "createdAt" // createdAt, price, rating, popularity
    const sortOrder = searchParams.get("sortOrder") || "desc" // asc, desc
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" }, 
        { status: 400 }
      )
    }

    // Validate sort parameters
    const validSortFields = ["createdAt", "price", "averageRating", "salesCount", "title"]
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: "Invalid sort field" }, 
        { status: 400 }
      )
    }

    // Validate difficulty if provided
    if (difficulty && !["beginner", "intermediate", "advanced"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" }, 
        { status: 400 }
      )
    }

    // Search patterns
    let patterns = searchPatterns(query, {
      category: category || undefined,
      difficulty: difficulty as "beginner" | "intermediate" | "advanced" || undefined,
      minPrice,
      maxPrice,
      creatorId: creatorId || undefined
    })

    // Sort patterns
    patterns.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case "price":
          aValue = a.price
          bValue = b.price
          break
        case "averageRating":
          aValue = a.averageRating
          bValue = b.averageRating
          break
        case "salesCount":
          aValue = a.salesCount
          bValue = b.salesCount
          break
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    // Calculate pagination
    const total = patterns.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPatterns = patterns.slice(startIndex, endIndex)

    // Include creator information
    const patternsWithCreators = getPatternsWithCreators(paginatedPatterns)

    // Generate search suggestions based on query
    const suggestions = generateSearchSuggestions(query, patterns)

    return NextResponse.json({
      patterns: patternsWithCreators,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        query,
        category,
        difficulty,
        minPrice,
        maxPrice,
        creatorId,
        sortBy,
        sortOrder
      },
      suggestions
    })

  } catch (error) {
    console.error("Error searching patterns:", error)
    return NextResponse.json(
      { error: "An error occurred while searching patterns" }, 
      { status: 500 }
    )
  }
}

function generateSearchSuggestions(query: string, allPatterns: any[]): string[] {
  if (!query || query.length < 2) return []

  const suggestions = new Set<string>()
  const lowerQuery = query.toLowerCase()

  // Extract suggestions from pattern titles and tags
  allPatterns.forEach(pattern => {
    // Title words
    const titleWords = pattern.title.toLowerCase().split(' ')
    titleWords.forEach((word: string) => {
      if (word.includes(lowerQuery) && word !== lowerQuery) {
        suggestions.add(pattern.title)
      }
    })

    // Tags
    pattern.tags.forEach((tag: string) => {
      if (tag.toLowerCase().includes(lowerQuery) && tag.toLowerCase() !== lowerQuery) {
        suggestions.add(tag)
      }
    })

    // Categories
    if (pattern.category.toLowerCase().includes(lowerQuery)) {
      suggestions.add(pattern.category)
    }
  })

  return Array.from(suggestions).slice(0, 5) // Limit to 5 suggestions
}
import { type NextRequest, NextResponse } from "next/server"
import { 
  getUserPatternLibrary,
  getPatternById,
  getPatternsWithCreators
} from "@/lib/pattern-db"
import { getUserById } from "@/lib/local-storage-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" }, 
        { status: 400 }
      )
    }

    // Verify user exists
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      )
    }

    // Get user's pattern library
    const libraryItems = getUserPatternLibrary(userId)

    // Get full pattern details for each library item
    const patternsWithDetails = []
    
    for (const item of libraryItems) {
      const pattern = getPatternById(item.patternId)
      if (pattern) {
        patternsWithDetails.push({
          libraryItem: item,
          pattern: pattern
        })
      }
    }

    // Include creator information
    const patterns = patternsWithDetails.map(item => item.pattern)
    const patternsWithCreators = getPatternsWithCreators(patterns)

    // Combine library info with pattern details
    const libraryWithPatterns = patternsWithDetails.map((item, index) => ({
      id: item.libraryItem.id,
      patternId: item.libraryItem.patternId,
      purchaseId: item.libraryItem.purchaseId,
      accessGrantedAt: item.libraryItem.accessGrantedAt,
      lastAccessedAt: item.libraryItem.lastAccessedAt,
      pattern: patternsWithCreators[index]
    }))

    // Sort by most recently purchased
    libraryWithPatterns.sort((a, b) => 
      new Date(b.accessGrantedAt).getTime() - new Date(a.accessGrantedAt).getTime()
    )

    return NextResponse.json({
      library: libraryWithPatterns,
      total: libraryWithPatterns.length
    })

  } catch (error) {
    console.error("Error fetching pattern library:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching your pattern library" }, 
      { status: 500 }
    )
  }
}
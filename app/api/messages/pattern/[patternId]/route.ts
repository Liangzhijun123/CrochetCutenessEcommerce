import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-middleware"
import { 
  getConversationsByUser,
  getConversationWithDetails,
  createConversation,
  getUserById,
  getProductById
} from "@/lib/local-storage-db"

// GET /api/messages/pattern/[patternId] - Get or create conversation for a pattern
export async function GET(
  request: NextRequest,
  { params }: { params: { patternId: string } }
) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patternId = params.patternId
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get("creatorId")

    // Verify pattern exists
    const pattern = getProductById(patternId)
    if (!pattern) {
      return NextResponse.json({ error: "Pattern not found" }, { status: 404 })
    }

    // If creatorId provided, verify creator exists
    if (creatorId) {
      const creator = getUserById(creatorId)
      if (!creator) {
        return NextResponse.json({ error: "Creator not found" }, { status: 404 })
      }
    }

    // Look for existing conversation for this pattern
    const userConversations = getConversationsByUser(authResult.user.id)
    const existingConversation = userConversations.find(conv => 
      conv.patternId === patternId && 
      (creatorId ? conv.participantIds.includes(creatorId) : true)
    )

    if (existingConversation) {
      const conversationDetails = getConversationWithDetails(existingConversation.id, authResult.user.id)
      return NextResponse.json({
        success: true,
        conversation: conversationDetails,
        isNew: false
      })
    }

    // If no existing conversation and creatorId provided, create new one
    if (creatorId && creatorId !== authResult.user.id) {
      const newConversation = createConversation({
        patternId,
        participantIds: [authResult.user.id, creatorId],
        title: `Discussion about ${pattern.name}`
      })

      const conversationDetails = getConversationWithDetails(newConversation.id, authResult.user.id)
      return NextResponse.json({
        success: true,
        conversation: conversationDetails,
        isNew: true
      })
    }

    // No existing conversation and no creator specified
    return NextResponse.json({
      success: true,
      conversation: null,
      pattern,
      message: "No existing conversation found"
    })

  } catch (error) {
    console.error("Error fetching pattern conversation:", error)
    return NextResponse.json(
      { error: "Failed to fetch pattern conversation" },
      { status: 500 }
    )
  }
}
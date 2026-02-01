import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-middleware"
import { 
  getConversationsByUser,
  getUnreadMessageCount,
  getUserById,
  getProductById
} from "@/lib/local-storage-db"

// GET /api/messages/conversations - Get user's conversations list
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversations = getConversationsByUser(authResult.user.id)
    const totalUnreadCount = getUnreadMessageCount(authResult.user.id)
    
    // Enrich conversations with participant details and unread counts
    const enrichedConversations = conversations.map(conversation => {
      const participants = conversation.participantIds.map(id => getUserById(id)).filter(Boolean)
      const otherParticipant = participants.find(p => p!.id !== authResult.user!.id)
      
      let pattern = null
      if (conversation.patternId) {
        pattern = getProductById(conversation.patternId)
      }

      // Calculate unread count for this conversation
      const unreadCount = 0 // Will be calculated by frontend from messages

      return {
        ...conversation,
        participants,
        otherParticipant,
        pattern,
        unreadCount
      }
    })

    return NextResponse.json({
      success: true,
      conversations: enrichedConversations,
      totalUnreadCount
    })

  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}
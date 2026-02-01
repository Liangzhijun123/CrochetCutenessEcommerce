import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-middleware"
import { 
  getConversationsByUser, 
  getConversationWithDetails,
  createConversation,
  createMessage,
  getUserById,
  getProductById
} from "@/lib/local-storage-db"

// GET /api/messages - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (conversationId) {
      // Get specific conversation with details
      const conversationDetails = getConversationWithDetails(conversationId, authResult.user.id)
      
      if (!conversationDetails) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        conversation: conversationDetails
      })
    } else {
      // Get all user's conversations
      const conversations = getConversationsByUser(authResult.user.id)
      
      // Enrich conversations with participant details and last message info
      const enrichedConversations = conversations.map(conversation => {
        const participants = conversation.participantIds.map(id => getUserById(id)).filter(Boolean)
        const otherParticipant = participants.find(p => p!.id !== authResult.user!.id)
        
        let pattern = null
        if (conversation.patternId) {
          pattern = getProductById(conversation.patternId)
        }

        return {
          ...conversation,
          participants,
          otherParticipant,
          pattern
        }
      })

      return NextResponse.json({
        success: true,
        conversations: enrichedConversations
      })
    }
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a new message or create conversation
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, content, patternId, conversationId, attachmentUrl, attachmentType, attachmentName } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    let targetConversationId = conversationId

    // If no conversation ID provided, find or create conversation
    if (!targetConversationId) {
      if (!recipientId) {
        return NextResponse.json({ error: "Recipient ID is required for new conversations" }, { status: 400 })
      }

      // Check if recipient exists
      const recipient = getUserById(recipientId)
      if (!recipient) {
        return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
      }

      // If pattern-specific, check if conversation already exists
      if (patternId) {
        const pattern = getProductById(patternId)
        if (!pattern) {
          return NextResponse.json({ error: "Pattern not found" }, { status: 404 })
        }

        // Look for existing conversation for this pattern between these users
        const existingConversation = getConversationsByUser(authResult.user.id)
          .find(conv => 
            conv.patternId === patternId && 
            conv.participantIds.includes(recipientId)
          )

        if (existingConversation) {
          targetConversationId = existingConversation.id
        } else {
          // Create new pattern-specific conversation
          const newConversation = createConversation({
            patternId,
            participantIds: [authResult.user.id, recipientId],
            title: `Discussion about ${pattern.name}`
          })
          targetConversationId = newConversation.id
        }
      } else {
        // Create general conversation
        const newConversation = createConversation({
          participantIds: [authResult.user.id, recipientId],
          title: `Conversation with ${recipient.name}`
        })
        targetConversationId = newConversation.id
      }
    }

    // Create the message
    const message = createMessage({
      conversationId: targetConversationId,
      senderId: authResult.user.id,
      recipientId: recipientId || "", // Will be determined from conversation
      content: content.trim(),
      attachmentUrl,
      attachmentType,
      attachmentName
    })

    // Get conversation details to return
    const conversationDetails = getConversationWithDetails(targetConversationId, authResult.user.id)

    return NextResponse.json({
      success: true,
      message,
      conversation: conversationDetails
    })

  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
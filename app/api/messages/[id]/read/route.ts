import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-middleware"
import { 
  markMessageAsRead,
  markConversationMessagesAsRead,
  getMessageById,
  getConversationById
} from "@/lib/local-storage-db"

// PUT /api/messages/[id]/read - Mark message as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messageId = params.id
    const body = await request.json()
    const { markConversation } = body

    if (markConversation) {
      // Mark all messages in conversation as read
      const message = getMessageById(messageId)
      if (!message) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 })
      }

      const conversation = getConversationById(message.conversationId)
      if (!conversation || !conversation.participantIds.includes(authResult.user.id)) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      const updatedCount = markConversationMessagesAsRead(message.conversationId, authResult.user.id)

      return NextResponse.json({
        success: true,
        updatedCount,
        message: `Marked ${updatedCount} messages as read`
      })
    } else {
      // Mark single message as read
      const message = getMessageById(messageId)
      if (!message) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 })
      }

      // Only recipient can mark message as read
      if (message.recipientId !== authResult.user.id) {
        return NextResponse.json({ error: "Unauthorized to mark this message as read" }, { status: 403 })
      }

      const updatedMessage = markMessageAsRead(messageId)

      return NextResponse.json({
        success: true,
        message: updatedMessage
      })
    }

  } catch (error) {
    console.error("Error marking message as read:", error)
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 }
    )
  }
}
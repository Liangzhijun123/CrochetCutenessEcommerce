import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const messageData = await request.json()

    // Validate required fields
    if (!messageData.name || !messageData.email || !messageData.message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    // Create new contact message
    const newMessage = db.createContactMessage(messageData)

    return NextResponse.json({
      message: "Your message has been sent successfully",
      id: newMessage.id,
    })
  } catch (error) {
    console.error("Error sending contact message:", error)
    return NextResponse.json({ error: "An error occurred while sending your message" }, { status: 500 })
  }
}

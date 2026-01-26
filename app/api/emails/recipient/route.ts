import { type NextRequest, NextResponse } from "next/server"
import { getEmailsForRecipient } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 })

    const emails = getEmailsForRecipient(email)
    return NextResponse.json({ emails })
  } catch (error) {
    console.error("[EMAILS-RECIPIENT] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

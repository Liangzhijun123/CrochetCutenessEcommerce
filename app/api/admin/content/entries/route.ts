import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { getCompetitionEntries, getCompetitions, getUsers, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/admin/content/entries - Get competition entries for moderation
async function getContentEntries(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    
    let entries = getCompetitionEntries()
    const competitions = getCompetitions()
    const users = getUsers()
    
    // Filter by moderation status
    if (status) {
      entries = entries.filter(e => (e.moderationStatus || 'pending') === status)
    }
    
    // Sort by submission date (newest first)
    entries.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    
    // Add competition and user information
    const entriesWithDetails = entries.map(entry => {
      const competition = competitions.find(c => c.id === entry.competitionId)
      const entryUser = users.find(u => u.id === entry.userId)
      
      return {
        ...entry,
        competitionTitle: competition?.title || 'Unknown Competition',
        userName: entryUser?.name || 'Unknown User',
        status: entry.moderationStatus || 'pending',
      }
    })
    
    return NextResponse.json({
      entries: entriesWithDetails,
    })
  } catch (error) {
    console.error("Get content entries error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(getContentEntries)

import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { getPatterns, initializeDatabase } from "@/lib/local-storage-db"

// GET /api/admin/content/patterns - Get patterns for moderation
async function getContentPatterns(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    
    let patterns = getPatterns()
    
    // Filter by moderation status
    if (status) {
      patterns = patterns.filter(p => (p.moderationStatus || 'pending') === status)
    }
    
    // Sort by creation date (newest first)
    patterns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Add creator information
    const patternsWithCreator = patterns.map(pattern => ({
      ...pattern,
      creatorName: pattern.creatorName || 'Unknown Creator',
      status: pattern.moderationStatus || 'pending',
    }))
    
    return NextResponse.json({
      patterns: patternsWithCreator,
    })
  } catch (error) {
    console.error("Get content patterns error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(getContentPatterns)

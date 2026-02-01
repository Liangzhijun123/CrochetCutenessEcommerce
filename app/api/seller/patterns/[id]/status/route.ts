import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patternId = params.id
    const body = await request.json()
    const { status } = body

    if (!patternId || !status) {
      return NextResponse.json({
        success: false,
        error: 'Pattern ID and status are required'
      }, { status: 400 })
    }

    const validStatuses = ['active', 'inactive', 'draft', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status'
      }, { status: 400 })
    }

    const db = await getDb()

    // Convert status to database format
    const isActive = status === 'active'
    const isDraft = status === 'draft'
    const isArchived = status === 'archived'

    const updateQuery = `
      UPDATE patterns 
      SET is_active = $1, is_draft = $2, is_archived = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `

    const result = await db.query(updateQuery, [
      isActive, isDraft, isArchived, patternId
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pattern not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Pattern status updated to ${status}`
    })

  } catch (error) {
    console.error('Update pattern status API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update pattern status'
    }, { status: 500 })
  }
}
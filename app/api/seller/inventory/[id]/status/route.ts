import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id
    const body = await request.json()
    const { status } = body

    if (!itemId || !status) {
      return NextResponse.json({
        success: false,
        error: 'Item ID and status are required'
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
      isActive, isDraft, isArchived, itemId
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Item not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Item status updated to ${status}`
    })

  } catch (error) {
    console.error('Update inventory item status API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update item status'
    }, { status: 500 })
  }
}
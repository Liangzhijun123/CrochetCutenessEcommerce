import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemIds, status } = body

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0 || !status) {
      return NextResponse.json({
        success: false,
        error: 'Item IDs array and status are required'
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

    // Create placeholders for the IN clause
    const placeholders = itemIds.map((_, index) => `$${index + 4}`).join(', ')

    const updateQuery = `
      UPDATE patterns 
      SET is_active = $1, is_draft = $2, is_archived = $3, updated_at = NOW()
      WHERE id IN (${placeholders})
      RETURNING id
    `

    const result = await db.query(updateQuery, [
      isActive, isDraft, isArchived, ...itemIds
    ])

    const updatedCount = result.rows.length

    return NextResponse.json({
      success: true,
      message: `${updatedCount} items updated to ${status}`,
      updatedCount
    })

  } catch (error) {
    console.error('Bulk update inventory API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to bulk update items'
    }, { status: 500 })
  }
}
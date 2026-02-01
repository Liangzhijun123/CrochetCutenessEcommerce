import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patternId = params.id
    const body = await request.json()
    const { title, description, price, category, difficulty } = body

    if (!patternId) {
      return NextResponse.json({
        success: false,
        error: 'Pattern ID is required'
      }, { status: 400 })
    }

    const db = await getDb()

    const updateQuery = `
      UPDATE patterns 
      SET title = $1, description = $2, price = $3, category = $4, 
          difficulty_level = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `

    const result = await db.query(updateQuery, [
      title, description, price, category, difficulty, patternId
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pattern not found'
      }, { status: 404 })
    }

    const pattern = result.rows[0]

    return NextResponse.json({
      success: true,
      pattern: {
        id: pattern.id,
        title: pattern.title,
        description: pattern.description,
        price: parseFloat(pattern.price),
        category: pattern.category,
        difficulty: pattern.difficulty_level,
        updatedAt: pattern.updated_at,
      }
    })

  } catch (error) {
    console.error('Update pattern API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update pattern'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patternId = params.id

    if (!patternId) {
      return NextResponse.json({
        success: false,
        error: 'Pattern ID is required'
      }, { status: 400 })
    }

    const db = await getDb()

    // Check if pattern has any purchases
    const purchaseCheckQuery = `
      SELECT COUNT(*) as purchase_count
      FROM purchases
      WHERE pattern_id = $1
    `

    const purchaseCheckResult = await db.query(purchaseCheckQuery, [patternId])
    const purchaseCount = parseInt(purchaseCheckResult.rows[0].purchase_count)

    if (purchaseCount > 0) {
      // If pattern has purchases, mark as inactive instead of deleting
      const updateQuery = `
        UPDATE patterns 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
      `
      await db.query(updateQuery, [patternId])

      return NextResponse.json({
        success: true,
        message: 'Pattern deactivated (cannot delete patterns with purchases)'
      })
    } else {
      // If no purchases, safe to delete
      const deleteQuery = `
        DELETE FROM patterns
        WHERE id = $1
      `
      await db.query(deleteQuery, [patternId])

      return NextResponse.json({
        success: true,
        message: 'Pattern deleted successfully'
      })
    }

  } catch (error) {
    console.error('Delete pattern API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete pattern'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

    const db_is_active = status === 'active'
    const db_is_draft = status === 'draft'
    const db_is_archived = status === 'archived'

    const { data: result, error } = await supabaseAdmin
      .from('patterns')
      .update({
        is_active: db_is_active,
        is_draft: db_is_draft,
        is_archived: db_is_archived,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()

    if (error || !result || result.length === 0) {
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
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
      .in('id', itemIds)
      .select('id')

    const updatedCount = result?.length || 0

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
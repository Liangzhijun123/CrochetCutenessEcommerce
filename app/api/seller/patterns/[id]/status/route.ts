import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
      .eq('id', patternId)
      .select()

    if (error || !result || result.length === 0) {
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
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

    const { data: pattern, error } = await supabaseAdmin
      .from('patterns')
      .update({
        title,
        description,
        price,
        category,
        difficulty_level: difficulty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', patternId)
      .select()
      .single()

    if (error || !pattern) {
      return NextResponse.json({
        success: false,
        error: 'Pattern not found'
      }, { status: 404 })
    }

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

    // Check if pattern has any purchases
    const { count } = await supabaseAdmin
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('pattern_id', patternId)

    if ((count || 0) > 0) {
      await supabaseAdmin
        .from('patterns')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', patternId)

      return NextResponse.json({
        success: true,
        message: 'Pattern deactivated (cannot delete patterns with purchases)'
      })
    } else {
      await supabaseAdmin
        .from('patterns')
        .delete()
        .eq('id', patternId)

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
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'Seller ID is required' }, { status: 400 })
    }

    const { data: patterns, error } = await supabaseAdmin
      .from('patterns')
      .select('*')
      .eq('creator_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching patterns:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch patterns' }, { status: 500 })
    }

    // Get purchases for these patterns
    const patternIds = (patterns || []).map(p => p.id)
    let purchasesByPattern: Record<string, { count: number; revenue: number }> = {}

    if (patternIds.length > 0) {
      const { data: purchases } = await supabaseAdmin
        .from('purchases')
        .select('pattern_id, amount_paid')
        .in('pattern_id', patternIds)

      for (const p of purchases || []) {
        if (!purchasesByPattern[p.pattern_id]) {
          purchasesByPattern[p.pattern_id] = { count: 0, revenue: 0 }
        }
        purchasesByPattern[p.pattern_id].count++
        purchasesByPattern[p.pattern_id].revenue += parseFloat(p.amount_paid) || 0
      }
    }

    const result = (patterns || []).map(p => {
      const sales = purchasesByPattern[p.id] || { count: 0, revenue: 0 }
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        price: parseFloat(p.price) || 0,
        category: p.category,
        difficulty: p.difficulty_level,
        status: p.is_active ? 'active' : 'inactive',
        thumbnail: p.thumbnail_url,
        patternFileUrl: p.pattern_file_url,
        tutorialVideoUrl: p.tutorial_video_url,
        salesCount: sales.count,
        revenue: sales.revenue,
        views: p.views || 0,
        rating: 0,
        reviewCount: 0,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }
    })

    return NextResponse.json({ success: true, patterns: result })

  } catch (error) {
    console.error('Patterns API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch patterns' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, title, description, price, category, difficulty, thumbnail, patternFileUrl, tutorialVideoUrl } = body

    if (!sellerId || !title || !price) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const { data: pattern, error } = await supabaseAdmin
      .from('patterns')
      .insert({
        creator_id: sellerId,
        title,
        description,
        price,
        category,
        difficulty_level: difficulty,
        thumbnail_url: thumbnail,
        pattern_file_url: patternFileUrl,
        tutorial_video_url: tutorialVideoUrl,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pattern:', error)
      return NextResponse.json({ success: false, error: 'Failed to create pattern' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      pattern: {
        id: pattern.id,
        title: pattern.title,
        description: pattern.description,
        price: parseFloat(pattern.price) || 0,
        category: pattern.category,
        difficulty: pattern.difficulty_level,
        status: 'active',
        thumbnail: pattern.thumbnail_url,
        patternFileUrl: pattern.pattern_file_url,
        tutorialVideoUrl: pattern.tutorial_video_url,
        salesCount: 0,
        revenue: 0,
        views: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: pattern.created_at,
        updatedAt: pattern.updated_at,
      }
    })

  } catch (error) {
    console.error('Create pattern API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create pattern' }, { status: 500 })
  }
}
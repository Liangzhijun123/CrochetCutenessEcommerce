import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'Seller ID is required' }, { status: 400 })
    }

    // Get patterns
    const { data: patterns } = await supabaseAdmin
      .from('patterns')
      .select('*')
      .eq('creator_id', sellerId)
      .order('created_at', { ascending: false })

    // Get products
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    // Get purchases for these items
    const patternIds = (patterns || []).map(p => p.id)
    let purchasesByItem: Record<string, { count: number; revenue: number; lastDate: string | null }> = {}

    if (patternIds.length > 0) {
      const { data: purchases } = await supabaseAdmin
        .from('purchases')
        .select('pattern_id, amount_paid, purchased_at')
        .in('pattern_id', patternIds)

      for (const p of purchases || []) {
        if (!purchasesByItem[p.pattern_id]) {
          purchasesByItem[p.pattern_id] = { count: 0, revenue: 0, lastDate: null }
        }
        purchasesByItem[p.pattern_id].count++
        purchasesByItem[p.pattern_id].revenue += parseFloat(p.amount_paid) || 0
        if (!purchasesByItem[p.pattern_id].lastDate || p.purchased_at > purchasesByItem[p.pattern_id].lastDate!) {
          purchasesByItem[p.pattern_id].lastDate = p.purchased_at
        }
      }
    }

    const inventory = [
      ...(patterns || []).map(p => {
        const sales = purchasesByItem[p.id] || { count: 0, revenue: 0, lastDate: null }
        const views = p.views || 0
        return {
          id: p.id,
          title: p.title,
          sku: `PAT-${p.id.slice(0, 8)}`,
          category: p.category || 'pattern',
          difficulty: p.difficulty_level,
          price: parseFloat(p.price) || 0,
          status: p.is_active ? 'active' : 'inactive',
          stockStatus: 'in_stock',
          thumbnail: p.thumbnail_url,
          salesCount: sales.count,
          revenue: sales.revenue,
          views,
          conversionRate: views > 0 ? (sales.count * 100.0 / views) : 0,
          lastSaleDate: sales.lastDate,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          isDigital: true,
          downloadCount: sales.count,
          averageRating: 0,
          reviewCount: 0,
        }
      }),
      ...(products || []).map(p => ({
        id: p.id,
        title: p.title,
        sku: `PRD-${p.id.slice(0, 8)}`,
        category: p.category || 'product',
        difficulty: p.difficulty_level,
        price: parseFloat(p.price) || 0,
        status: 'active',
        stockStatus: 'in_stock',
        thumbnail: p.image_url,
        salesCount: p.purchases || 0,
        revenue: (p.purchases || 0) * (parseFloat(p.price) || 0),
        views: p.views || 0,
        conversionRate: (p.views || 0) > 0 ? ((p.purchases || 0) * 100.0 / p.views) : 0,
        lastSaleDate: null,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        isDigital: !!p.file_url,
        downloadCount: p.purchases || 0,
        averageRating: p.rating || 0,
        reviewCount: 0,
      })),
    ]

    const stats = {
      totalItems: inventory.length,
      activeItems: inventory.filter(item => item.status === 'active').length,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalRevenue: inventory.reduce((sum, item) => sum + item.revenue, 0),
      topPerformer: inventory.length > 0
        ? inventory.reduce((top, item) => item.revenue > top.revenue ? item : top).title
        : 'No sales yet'
    }

    return NextResponse.json({ success: true, inventory, stats })

  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
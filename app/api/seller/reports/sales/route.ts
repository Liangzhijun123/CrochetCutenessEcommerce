import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    if (!sellerId || !fromDate || !toDate) {
      return NextResponse.json({ success: false, error: 'Seller ID, from date, and to date are required' }, { status: 400 })
    }

    const startDate = new Date(fromDate).toISOString()
    const endDate = new Date(toDate).toISOString()

    // Get seller's patterns and products
    const { data: patterns } = await supabaseAdmin
      .from('patterns')
      .select('id, title, thumbnail_url')
      .eq('creator_id', sellerId)

    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, title, image_url')
      .eq('seller_id', sellerId)

    const patternIds = (patterns || []).map(p => p.id)
    const productIds = (products || []).map(p => p.id)
    const allIds = [...patternIds, ...productIds]

    // Get purchases in date range
    let purchases: any[] = []
    if (allIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('purchases')
        .select('id, user_id, pattern_id, amount_paid, purchased_at')
        .in('pattern_id', allIds)
        .gte('purchased_at', startDate)
        .lte('purchased_at', endDate)
        .order('purchased_at', { ascending: false })

      purchases = data || []
    }

    // Calculate summary
    const totalRevenue = purchases.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0)
    const totalSales = purchases.length
    const uniqueCustomers = new Set(purchases.map(p => p.user_id)).size
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Top selling pattern
    const salesByPattern: Record<string, number> = {}
    for (const p of purchases) {
      salesByPattern[p.pattern_id] = (salesByPattern[p.pattern_id] || 0) + 1
    }
    const topPatternId = Object.entries(salesByPattern).sort((a, b) => b[1] - a[1])[0]?.[0]
    const allItems = [...(patterns || []), ...(products || [])]
    const topSellingPattern = allItems.find(p => p.id === topPatternId)?.title || 'No sales'

    // Daily sales
    const dailyMap: Record<string, { revenue: number; sales: number; customers: Set<string> }> = {}
    for (const p of purchases) {
      const date = p.purchased_at.split('T')[0]
      if (!dailyMap[date]) dailyMap[date] = { revenue: 0, sales: 0, customers: new Set() }
      dailyMap[date].revenue += parseFloat(p.amount_paid) || 0
      dailyMap[date].sales++
      dailyMap[date].customers.add(p.user_id)
    }
    const dailySales = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date, revenue: d.revenue, sales: d.sales, customers: d.customers.size }))

    // Top patterns by revenue
    const revenueByPattern: Record<string, { sales: number; revenue: number }> = {}
    for (const p of purchases) {
      if (!revenueByPattern[p.pattern_id]) revenueByPattern[p.pattern_id] = { sales: 0, revenue: 0 }
      revenueByPattern[p.pattern_id].sales++
      revenueByPattern[p.pattern_id].revenue += parseFloat(p.amount_paid) || 0
    }
    const topPatterns = Object.entries(revenueByPattern)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([id, data]) => {
        const item = allItems.find(p => p.id === id)
        return {
          id,
          title: item?.title || 'Unknown',
          thumbnail: item?.thumbnail_url || item?.image_url || null,
          sales: data.sales,
          revenue: data.revenue,
        }
      })

    // Recent transactions
    const purchaseUserIds = [...new Set(purchases.map(p => p.user_id))]
    let userMap: Record<string, { name: string; email: string }> = {}
    if (purchaseUserIds.length > 0) {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email')
        .in('id', purchaseUserIds)

      for (const u of users || []) {
        userMap[u.id] = { name: u.full_name || 'Customer', email: u.email }
      }
    }

    const patternMap: Record<string, string> = {}
    for (const item of allItems) patternMap[item.id] = item.title

    const recentTransactions = purchases.slice(0, 20).map(p => ({
      id: p.id,
      customerName: userMap[p.user_id]?.name || 'Customer',
      customerEmail: userMap[p.user_id]?.email || '',
      patternTitle: patternMap[p.pattern_id] || 'Unknown',
      amount: parseFloat(p.amount_paid) || 0,
      date: p.purchased_at,
      status: 'completed',
    }))

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalSales,
          totalCustomers: uniqueCustomers,
          averageOrderValue,
          topSellingPattern,
          revenueGrowth: 0,
          salesGrowth: 0,
        },
        dailySales,
        topPatterns,
        customerSegments: [],
        salesByRegion: [],
        recentTransactions,
      },
    })

  } catch (error) {
    console.error('Sales report API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate sales report' }, { status: 500 })
  }
}
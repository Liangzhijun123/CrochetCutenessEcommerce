import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const period = searchParams.get('period') || '30d'

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        error: 'Seller ID is required'
      }, { status: 400 })
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startDateStr = startDate.toISOString()

    // Get seller's patterns
    const { data: patterns } = await supabaseAdmin
      .from('patterns')
      .select('id, title, thumbnail_url, sales_count')
      .eq('creator_id', sellerId)

    // Also check products table
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, title, image_url, views, purchases, price')
      .eq('seller_id', sellerId)

    const patternIds = (patterns || []).map(p => p.id)
    const productIds = (products || []).map(p => p.id)
    const allItemIds = [...patternIds, ...productIds]

    // Get purchases for this seller's items in the period
    let purchases: any[] = []
    if (allItemIds.length > 0) {
      const { data: purchaseData } = await supabaseAdmin
        .from('purchases')
        .select('id, user_id, pattern_id, amount_paid, creator_commission, purchased_at')
        .in('pattern_id', allItemIds)
        .gte('purchased_at', startDateStr)
        .order('purchased_at', { ascending: false })
      purchases = purchaseData || []
    }

    // Get previous period purchases for growth comparison
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    let previousPurchases: any[] = []
    if (allItemIds.length > 0) {
      const { data: prevData } = await supabaseAdmin
        .from('purchases')
        .select('id, amount_paid')
        .in('pattern_id', allItemIds)
        .gte('purchased_at', previousStartDate.toISOString())
        .lt('purchased_at', startDateStr)
      previousPurchases = prevData || []
    }

    // Calculate summary
    const totalRevenue = purchases.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0)
    const totalSales = purchases.length
    const uniqueCustomers = new Set(purchases.map(p => p.user_id)).size
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
    const totalViews = (products || []).reduce((sum, p) => sum + (p.views || 0), 0)
    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0

    const previousRevenue = previousPurchases.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0)
    const previousSalesCount = previousPurchases.length
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const salesGrowth = previousSalesCount > 0 ? ((totalSales - previousSalesCount) / previousSalesCount) * 100 : 0

    // Find top selling pattern
    const patternSalesMap: Record<string, number> = {}
    purchases.forEach(p => {
      patternSalesMap[p.pattern_id] = (patternSalesMap[p.pattern_id] || 0) + 1
    })
    const topPatternId = Object.entries(patternSalesMap).sort((a, b) => b[1] - a[1])[0]?.[0]
    const topSellingPattern = [...(patterns || []), ...(products || [])].find(p => p.id === topPatternId)?.title || 'No sales yet'

    // Build revenue chart data (daily)
    const dailyData: Record<string, { revenue: number; sales: number }> = {}
    purchases.forEach(p => {
      const date = new Date(p.purchased_at).toISOString().split('T')[0]
      if (!dailyData[date]) dailyData[date] = { revenue: 0, sales: 0 }
      dailyData[date].revenue += parseFloat(p.amount_paid) || 0
      dailyData[date].sales += 1
    })

    const revenueChart = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, revenue: data.revenue, sales: data.sales }))

    // Pattern performance
    const patternPerformance = [...(patterns || []), ...(products || [])].map(item => {
      const itemPurchases = purchases.filter(p => p.pattern_id === item.id)
      const revenue = itemPurchases.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0)
      const views = ('views' in item ? item.views : 0) || 0
      return {
        id: item.id,
        title: item.title,
        thumbnail: ('thumbnail_url' in item ? item.thumbnail_url : ('image_url' in item ? item.image_url : null)),
        sales: itemPurchases.length,
        revenue,
        views,
        conversionRate: views > 0 ? (itemPurchases.length / views) * 100 : 0,
      }
    }).sort((a, b) => b.revenue - a.revenue)

    // Customer insights
    const customerOrderCounts: Record<string, number> = {}
    purchases.forEach(p => {
      customerOrderCounts[p.user_id] = (customerOrderCounts[p.user_id] || 0) + 1
    })
    const returningCustomers = Object.values(customerOrderCounts).filter(c => c > 1).length
    const customerTotals = Object.keys(customerOrderCounts).map(uid => {
      return purchases.filter(p => p.user_id === uid).reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0)
    })
    const avgLifetimeValue = customerTotals.length > 0 ? customerTotals.reduce((a, b) => a + b, 0) / customerTotals.length : 0

    const analyticsData = {
      summary: {
        totalRevenue,
        totalSales,
        totalViews,
        conversionRate,
        averageOrderValue: avgOrderValue,
        topSellingPattern,
        revenueGrowth,
        salesGrowth,
      },
      revenueChart,
      patternPerformance,
      customerInsights: {
        totalCustomers: uniqueCustomers,
        returningCustomers,
        averageLifetimeValue: avgLifetimeValue,
        topCountries: [],
      },
      salesByCategory: [],
    }

    return NextResponse.json({ success: true, data: analyticsData })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'

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

    const db = await getDb()

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

    // Get summary data
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(p.amount_paid), 0) as total_revenue,
        COUNT(p.id) as total_sales,
        COUNT(DISTINCT p.user_id) as total_customers,
        COALESCE(AVG(p.amount_paid), 0) as average_order_value,
        COALESCE(SUM(CASE WHEN pt.views > 0 THEN 1 ELSE 0 END), 0) as total_views,
        COALESCE(AVG(CASE WHEN pt.views > 0 THEN (COUNT(p.id) * 100.0 / pt.views) ELSE 0 END), 0) as conversion_rate
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2
    `

    const summaryResult = await db.query(summaryQuery, [sellerId, startDate])
    const summary = summaryResult.rows[0]

    // Get top selling pattern
    const topPatternQuery = `
      SELECT pt.title
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2
      GROUP BY pt.id, pt.title
      ORDER BY COUNT(p.id) DESC
      LIMIT 1
    `

    const topPatternResult = await db.query(topPatternQuery, [sellerId, startDate])
    const topSellingPattern = topPatternResult.rows[0]?.title || 'No sales yet'

    // Calculate growth rates (comparing with previous period)
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    
    const previousSummaryQuery = `
      SELECT 
        COALESCE(SUM(p.amount_paid), 0) as total_revenue,
        COUNT(p.id) as total_sales
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at < $3
    `

    const previousSummaryResult = await db.query(previousSummaryQuery, [sellerId, previousStartDate, startDate])
    const previousSummary = previousSummaryResult.rows[0]

    const revenueGrowth = previousSummary.total_revenue > 0 
      ? ((summary.total_revenue - previousSummary.total_revenue) / previousSummary.total_revenue) * 100
      : 0

    const salesGrowth = previousSummary.total_sales > 0
      ? ((summary.total_sales - previousSummary.total_sales) / previousSummary.total_sales) * 100
      : 0

    // Get daily revenue chart data
    const revenueChartQuery = `
      SELECT 
        DATE(p.purchased_at) as date,
        COALESCE(SUM(p.amount_paid), 0) as revenue,
        COUNT(p.id) as sales
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2
      GROUP BY DATE(p.purchased_at)
      ORDER BY DATE(p.purchased_at)
    `

    const revenueChartResult = await db.query(revenueChartQuery, [sellerId, startDate])

    // Get pattern performance data
    const patternPerformanceQuery = `
      SELECT 
        pt.id,
        pt.title,
        pt.thumbnail_url as thumbnail,
        COUNT(p.id) as sales,
        COALESCE(SUM(p.amount_paid), 0) as revenue,
        pt.views,
        CASE WHEN pt.views > 0 THEN (COUNT(p.id) * 100.0 / pt.views) ELSE 0 END as conversion_rate
      FROM patterns pt
      LEFT JOIN purchases p ON pt.id = p.pattern_id AND p.purchased_at >= $2
      WHERE pt.creator_id = $1
      GROUP BY pt.id, pt.title, pt.thumbnail_url, pt.views
      ORDER BY revenue DESC
      LIMIT 10
    `

    const patternPerformanceResult = await db.query(patternPerformanceQuery, [sellerId, startDate])

    // Get customer insights
    const customerInsightsQuery = `
      SELECT 
        COUNT(DISTINCT p.user_id) as total_customers,
        COUNT(CASE WHEN customer_orders.order_count > 1 THEN 1 END) as returning_customers,
        COALESCE(AVG(customer_totals.total_spent), 0) as average_lifetime_value
      FROM (
        SELECT DISTINCT p.user_id
        FROM purchases p
        JOIN patterns pt ON p.pattern_id = pt.id
        WHERE pt.creator_id = $1 AND p.purchased_at >= $2
      ) unique_customers
      LEFT JOIN (
        SELECT 
          p.user_id,
          COUNT(p.id) as order_count
        FROM purchases p
        JOIN patterns pt ON p.pattern_id = pt.id
        WHERE pt.creator_id = $1
        GROUP BY p.user_id
      ) customer_orders ON unique_customers.user_id = customer_orders.user_id
      LEFT JOIN (
        SELECT 
          p.user_id,
          SUM(p.amount_paid) as total_spent
        FROM purchases p
        JOIN patterns pt ON p.pattern_id = pt.id
        WHERE pt.creator_id = $1
        GROUP BY p.user_id
      ) customer_totals ON unique_customers.user_id = customer_totals.user_id
    `

    const customerInsightsResult = await db.query(customerInsightsQuery, [sellerId, startDate])
    const customerInsights = customerInsightsResult.rows[0]

    // Get top countries (mock data for now)
    const topCountries = [
      { country: 'United States', customers: 45, revenue: 1250.00 },
      { country: 'Canada', customers: 23, revenue: 680.50 },
      { country: 'United Kingdom', customers: 18, revenue: 520.25 },
      { country: 'Australia', customers: 12, revenue: 340.75 },
      { country: 'Germany', customers: 8, revenue: 225.00 },
    ]

    // Get sales by category
    const salesByCategoryQuery = `
      SELECT 
        pt.category,
        COUNT(p.id) as sales,
        COALESCE(SUM(p.amount_paid), 0) as revenue
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2
      GROUP BY pt.category
      ORDER BY revenue DESC
    `

    const salesByCategoryResult = await db.query(salesByCategoryQuery, [sellerId, startDate])

    const analyticsData = {
      summary: {
        totalRevenue: parseFloat(summary.total_revenue),
        totalSales: parseInt(summary.total_sales),
        totalViews: parseInt(summary.total_views),
        conversionRate: parseFloat(summary.conversion_rate),
        averageOrderValue: parseFloat(summary.average_order_value),
        topSellingPattern,
        revenueGrowth,
        salesGrowth,
      },
      revenueChart: revenueChartResult.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        sales: parseInt(row.sales),
      })),
      patternPerformance: patternPerformanceResult.rows.map(row => ({
        id: row.id,
        title: row.title,
        thumbnail: row.thumbnail,
        sales: parseInt(row.sales),
        revenue: parseFloat(row.revenue),
        views: parseInt(row.views),
        conversionRate: parseFloat(row.conversion_rate),
      })),
      customerInsights: {
        totalCustomers: parseInt(customerInsights.total_customers),
        returningCustomers: parseInt(customerInsights.returning_customers),
        averageLifetimeValue: parseFloat(customerInsights.average_lifetime_value),
        topCountries,
      },
      salesByCategory: salesByCategoryResult.rows.map(row => ({
        category: row.category,
        sales: parseInt(row.sales),
        revenue: parseFloat(row.revenue),
      })),
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data'
    }, { status: 500 })
  }
}
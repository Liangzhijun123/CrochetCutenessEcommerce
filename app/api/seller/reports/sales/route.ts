import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    if (!sellerId || !fromDate || !toDate) {
      return NextResponse.json({
        success: false,
        error: 'Seller ID, from date, and to date are required'
      }, { status: 400 })
    }

    const db = await getDb()
    const startDate = new Date(fromDate)
    const endDate = new Date(toDate)

    // Calculate previous period for growth comparison
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousStartDate = new Date(startDate.getTime() - periodLength)
    const previousEndDate = startDate

    // Get summary data for current period
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(p.amount_paid), 0) as total_revenue,
        COUNT(p.id) as total_sales,
        COUNT(DISTINCT p.user_id) as total_customers,
        COALESCE(AVG(p.amount_paid), 0) as average_order_value
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at <= $3
    `

    const summaryResult = await db.query(summaryQuery, [sellerId, startDate, endDate])
    const summary = summaryResult.rows[0]

    // Get summary data for previous period
    const previousSummaryResult = await db.query(summaryQuery, [sellerId, previousStartDate, previousEndDate])
    const previousSummary = previousSummaryResult.rows[0]

    // Calculate growth rates
    const revenueGrowth = previousSummary.total_revenue > 0 
      ? ((summary.total_revenue - previousSummary.total_revenue) / previousSummary.total_revenue) * 100
      : 0

    const salesGrowth = previousSummary.total_sales > 0
      ? ((summary.total_sales - previousSummary.total_sales) / previousSummary.total_sales) * 100
      : 0

    // Get top selling pattern
    const topPatternQuery = `
      SELECT pt.title
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at <= $3
      GROUP BY pt.id, pt.title
      ORDER BY COUNT(p.id) DESC
      LIMIT 1
    `

    const topPatternResult = await db.query(topPatternQuery, [sellerId, startDate, endDate])
    const topSellingPattern = topPatternResult.rows[0]?.title || 'No sales'

    // Get daily sales data
    const dailySalesQuery = `
      SELECT 
        DATE(p.purchased_at) as date,
        COALESCE(SUM(p.amount_paid), 0) as revenue,
        COUNT(p.id) as sales,
        COUNT(DISTINCT p.user_id) as customers
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at <= $3
      GROUP BY DATE(p.purchased_at)
      ORDER BY DATE(p.purchased_at)
    `

    const dailySalesResult = await db.query(dailySalesQuery, [sellerId, startDate, endDate])

    // Get top patterns
    const topPatternsQuery = `
      SELECT 
        pt.id,
        pt.title,
        pt.thumbnail_url as thumbnail,
        COUNT(p.id) as sales,
        COALESCE(SUM(p.amount_paid), 0) as revenue
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at <= $3
      GROUP BY pt.id, pt.title, pt.thumbnail_url
      ORDER BY revenue DESC
      LIMIT 10
    `

    const topPatternsResult = await db.query(topPatternsQuery, [sellerId, startDate, endDate])

    // Get customer segments (mock data for now)
    const customerSegments = [
      { segment: 'New Customers', customers: 45, revenue: 1250.00, averageOrderValue: 27.78 },
      { segment: 'Returning Customers', customers: 23, revenue: 890.50, averageOrderValue: 38.72 },
      { segment: 'VIP Customers', customers: 8, revenue: 520.25, averageOrderValue: 65.03 },
    ]

    // Get sales by region (mock data for now)
    const salesByRegion = [
      { region: 'North America', sales: 45, revenue: 1250.00, customers: 38 },
      { region: 'Europe', sales: 23, revenue: 680.50, customers: 21 },
      { region: 'Asia Pacific', sales: 18, revenue: 520.25, customers: 16 },
      { region: 'Other', sales: 12, revenue: 340.75, customers: 11 },
    ]

    // Get recent transactions
    const recentTransactionsQuery = `
      SELECT 
        p.id,
        u.name as customer_name,
        u.email as customer_email,
        pt.title as pattern_title,
        p.amount_paid as amount,
        p.purchased_at as date,
        'completed' as status
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      JOIN users u ON p.user_id = u.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at <= $3
      ORDER BY p.purchased_at DESC
      LIMIT 20
    `

    const recentTransactionsResult = await db.query(recentTransactionsQuery, [sellerId, startDate, endDate])

    const reportData = {
      summary: {
        totalRevenue: parseFloat(summary.total_revenue),
        totalSales: parseInt(summary.total_sales),
        totalCustomers: parseInt(summary.total_customers),
        averageOrderValue: parseFloat(summary.average_order_value),
        topSellingPattern,
        revenueGrowth,
        salesGrowth,
      },
      dailySales: dailySalesResult.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        sales: parseInt(row.sales),
        customers: parseInt(row.customers),
      })),
      topPatterns: topPatternsResult.rows.map(row => ({
        id: row.id,
        title: row.title,
        thumbnail: row.thumbnail,
        sales: parseInt(row.sales),
        revenue: parseFloat(row.revenue),
      })),
      customerSegments,
      salesByRegion,
      recentTransactions: recentTransactionsResult.rows.map(row => ({
        id: row.id,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        patternTitle: row.pattern_title,
        amount: parseFloat(row.amount),
        date: row.date,
        status: row.status,
      })),
    }

    return NextResponse.json({
      success: true,
      data: reportData,
    })

  } catch (error) {
    console.error('Sales report API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate sales report'
    }, { status: 500 })
  }
}
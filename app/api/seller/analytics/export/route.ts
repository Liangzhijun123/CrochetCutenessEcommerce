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

    // Get detailed analytics data for export
    const analyticsQuery = `
      SELECT 
        DATE(p.purchased_at) as date,
        pt.title as pattern_title,
        pt.category,
        pt.difficulty_level as difficulty,
        pt.price,
        p.amount_paid as sale_amount,
        p.creator_commission as commission,
        p.platform_fee,
        u.name as customer_name,
        u.email as customer_email,
        p.payment_method,
        p.transaction_id
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      JOIN users u ON p.user_id = u.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2
      ORDER BY p.purchased_at DESC
    `

    const analyticsResult = await db.query(analyticsQuery, [sellerId, startDate])

    // Create CSV content
    const headers = [
      'Date',
      'Pattern Title',
      'Category',
      'Difficulty',
      'Pattern Price',
      'Sale Amount',
      'Your Commission',
      'Platform Fee',
      'Customer Name',
      'Customer Email',
      'Payment Method',
      'Transaction ID'
    ]

    const csvRows = [
      headers.join(','),
      ...analyticsResult.rows.map(row => [
        new Date(row.date).toISOString().split('T')[0],
        `"${row.pattern_title}"`,
        row.category,
        row.difficulty,
        row.price,
        row.sale_amount,
        row.commission,
        row.platform_fee,
        `"${row.customer_name}"`,
        row.customer_email,
        row.payment_method,
        row.transaction_id
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${period}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Analytics export API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to export analytics data'
    }, { status: 500 })
  }
}
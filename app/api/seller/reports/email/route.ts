import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'
import { sendEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, from, to } = body

    if (!sellerId || !from || !to) {
      return NextResponse.json({
        success: false,
        error: 'Seller ID, from date, and to date are required'
      }, { status: 400 })
    }

    const db = await getDb()
    const startDate = new Date(from)
    const endDate = new Date(to)

    // Get seller information
    const sellerQuery = `
      SELECT u.name, u.email
      FROM users u
      WHERE u.id = $1
    `

    const sellerResult = await db.query(sellerQuery, [sellerId])
    
    if (sellerResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Seller not found'
      }, { status: 404 })
    }

    const seller = sellerResult.rows[0]

    // Get summary data
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(p.amount_paid), 0) as total_revenue,
        COUNT(p.id) as total_sales,
        COUNT(DISTINCT p.user_id) as total_customers,
        COALESCE(AVG(p.amount_paid), 0) as average_order_value,
        COALESCE(SUM(p.creator_commission), 0) as total_commission
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at <= $3
    `

    const summaryResult = await db.query(summaryQuery, [sellerId, startDate, endDate])
    const summary = summaryResult.rows[0]

    // Get top patterns
    const topPatternsQuery = `
      SELECT 
        pt.title,
        COUNT(p.id) as sales,
        COALESCE(SUM(p.amount_paid), 0) as revenue
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at <= $3
      GROUP BY pt.id, pt.title
      ORDER BY revenue DESC
      LIMIT 5
    `

    const topPatternsResult = await db.query(topPatternsQuery, [sellerId, startDate, endDate])

    // Create email content
    const emailSubject = `Sales Report - ${startDate.toDateString()} to ${endDate.toDateString()}`
    
    const emailContent = `
      <h2>Sales Report</h2>
      <p><strong>Period:</strong> ${startDate.toDateString()} - ${endDate.toDateString()}</p>
      
      <h3>Summary</h3>
      <ul>
        <li><strong>Total Sales:</strong> ${summary.total_sales}</li>
        <li><strong>Total Revenue:</strong> $${parseFloat(summary.total_revenue).toFixed(2)}</li>
        <li><strong>Your Commission:</strong> $${parseFloat(summary.total_commission).toFixed(2)}</li>
        <li><strong>Total Customers:</strong> ${summary.total_customers}</li>
        <li><strong>Average Order Value:</strong> $${parseFloat(summary.average_order_value).toFixed(2)}</li>
      </ul>

      <h3>Top Performing Patterns</h3>
      <ol>
        ${topPatternsResult.rows.map(pattern => 
          `<li>${pattern.title} - ${pattern.sales} sales, $${parseFloat(pattern.revenue).toFixed(2)} revenue</li>`
        ).join('')}
      </ol>

      <p>For detailed transaction data, please log in to your seller dashboard and generate a detailed report.</p>
      
      <p>Best regards,<br>The Crochet Community Platform Team</p>
    `

    // Send email
    await sendEmail({
      to: seller.email,
      subject: emailSubject,
      html: emailContent,
    })

    return NextResponse.json({
      success: true,
      message: 'Sales report sent to your email address'
    })

  } catch (error) {
    console.error('Email report API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send report via email'
    }, { status: 500 })
  }
}
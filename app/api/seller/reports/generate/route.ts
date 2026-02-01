import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    const format = searchParams.get('format') || 'csv'

    if (!sellerId || !fromDate || !toDate) {
      return NextResponse.json({
        success: false,
        error: 'Seller ID, from date, and to date are required'
      }, { status: 400 })
    }

    const db = await getDb()
    const startDate = new Date(fromDate)
    const endDate = new Date(toDate)

    // Get detailed sales data for export
    const salesDataQuery = `
      SELECT 
        p.id as transaction_id,
        p.purchased_at as date,
        u.name as customer_name,
        u.email as customer_email,
        pt.title as pattern_title,
        pt.category,
        pt.difficulty_level as difficulty,
        p.amount_paid as amount,
        p.creator_commission as commission,
        p.platform_fee,
        p.payment_method,
        p.transaction_id as payment_transaction_id
      FROM purchases p
      JOIN patterns pt ON p.pattern_id = pt.id
      JOIN users u ON p.user_id = u.id
      WHERE pt.creator_id = $1 AND p.purchased_at >= $2 AND p.purchased_at <= $3
      ORDER BY p.purchased_at DESC
    `

    const salesDataResult = await db.query(salesDataQuery, [sellerId, startDate, endDate])
    const salesData = salesDataResult.rows

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Transaction ID',
        'Date',
        'Customer Name',
        'Customer Email',
        'Pattern Title',
        'Category',
        'Difficulty',
        'Amount',
        'Commission',
        'Platform Fee',
        'Payment Method',
        'Payment Transaction ID'
      ]

      const csvRows = [
        headers.join(','),
        ...salesData.map(row => [
          row.transaction_id,
          new Date(row.date).toISOString().split('T')[0],
          `"${row.customer_name}"`,
          row.customer_email,
          `"${row.pattern_title}"`,
          row.category,
          row.difficulty,
          row.amount,
          row.commission,
          row.platform_fee,
          row.payment_method,
          row.payment_transaction_id
        ].join(','))
      ]

      const csvContent = csvRows.join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'excel') {
      // For Excel format, we'll return CSV with Excel MIME type
      // In a real implementation, you'd use a library like xlsx to generate proper Excel files
      const headers = [
        'Transaction ID',
        'Date',
        'Customer Name',
        'Customer Email',
        'Pattern Title',
        'Category',
        'Difficulty',
        'Amount',
        'Commission',
        'Platform Fee',
        'Payment Method',
        'Payment Transaction ID'
      ]

      const csvRows = [
        headers.join('\t'),
        ...salesData.map(row => [
          row.transaction_id,
          new Date(row.date).toISOString().split('T')[0],
          row.customer_name,
          row.customer_email,
          row.pattern_title,
          row.category,
          row.difficulty,
          row.amount,
          row.commission,
          row.platform_fee,
          row.payment_method,
          row.payment_transaction_id
        ].join('\t'))
      ]

      const tsvContent = csvRows.join('\n')

      return new NextResponse(tsvContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.xls"`
        }
      })
    }

    if (format === 'pdf') {
      // For PDF format, we'll return a simple text report
      // In a real implementation, you'd use a library like puppeteer or jsPDF
      const reportContent = `
SALES REPORT
Period: ${startDate.toDateString()} - ${endDate.toDateString()}

SUMMARY:
Total Sales: ${salesData.length}
Total Revenue: $${salesData.reduce((sum, row) => sum + parseFloat(row.amount), 0).toFixed(2)}
Total Commission: $${salesData.reduce((sum, row) => sum + parseFloat(row.commission), 0).toFixed(2)}

DETAILED TRANSACTIONS:
${salesData.map(row => 
  `${new Date(row.date).toDateString()} - ${row.pattern_title} - ${row.customer_name} - $${row.amount}`
).join('\n')}
      `

      return new NextResponse(reportContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="sales-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.pdf"`
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Unsupported format'
    }, { status: 400 })

  } catch (error) {
    console.error('Generate report API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate report'
    }, { status: 500 })
  }
}
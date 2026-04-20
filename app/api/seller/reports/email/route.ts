import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
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

    const startDate = new Date(from)
    const endDate = new Date(to)

    // Get seller information
    const { data: seller, error: sellerErr } = await supabaseAdmin
      .from('users')
      .select('full_name, email')
      .eq('id', sellerId)
      .single()

    if (sellerErr || !seller) {
      return NextResponse.json({
        success: false,
        error: 'Seller not found'
      }, { status: 404 })
    }

    // Get summary data
    const { data: purchases } = await supabaseAdmin
      .from('purchases')
      .select('*, patterns!inner(creator_id)')
      .eq('patterns.creator_id', sellerId)
      .gte('purchased_at', startDate.toISOString())
      .lte('purchased_at', endDate.toISOString())

    const purchaseData = purchases || []
    const summary = {
      total_sales: purchaseData.length,
      total_revenue: purchaseData.reduce((sum: number, p: any) => sum + (parseFloat(p.amount_paid) || 0), 0),
      total_commission: purchaseData.reduce((sum: number, p: any) => sum + (parseFloat(p.creator_commission) || 0), 0),
      total_customers: new Set(purchaseData.map((p: any) => p.user_id)).size,
      average_order_value: purchaseData.length > 0 
        ? purchaseData.reduce((sum: number, p: any) => sum + (parseFloat(p.amount_paid) || 0), 0) / purchaseData.length 
        : 0,
    }

    // Get top patterns
    const { data: topPatterns } = await supabaseAdmin
      .from('purchases')
      .select('pattern_id, amount_paid, patterns!inner(title, creator_id)')
      .eq('patterns.creator_id', sellerId)
      .gte('purchased_at', startDate.toISOString())
      .lte('purchased_at', endDate.toISOString())

    const patternMap = new Map<string, { title: string; sales: number; revenue: number }>()
    for (const p of topPatterns || []) {
      const pid = p.pattern_id
      const existing = patternMap.get(pid) || { title: (p as any).patterns?.title || '', sales: 0, revenue: 0 }
      existing.sales++
      existing.revenue += parseFloat(p.amount_paid) || 0
      patternMap.set(pid, existing)
    }
    const topPatternsList = Array.from(patternMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    // Create email content
    const emailSubject = `Sales Report - ${startDate.toDateString()} to ${endDate.toDateString()}`
    
    const emailContent = `
      <h2>Sales Report</h2>
      <p><strong>Period:</strong> ${startDate.toDateString()} - ${endDate.toDateString()}</p>
      
      <h3>Summary</h3>
      <ul>
        <li><strong>Total Sales:</strong> ${summary.total_sales}</li>
        <li><strong>Total Revenue:</strong> $${summary.total_revenue.toFixed(2)}</li>
        <li><strong>Your Commission:</strong> $${summary.total_commission.toFixed(2)}</li>
        <li><strong>Total Customers:</strong> ${summary.total_customers}</li>
        <li><strong>Average Order Value:</strong> $${summary.average_order_value.toFixed(2)}</li>
      </ul>

      <h3>Top Performing Patterns</h3>
      <ol>
        ${topPatternsList.map(pattern => 
          `<li>${pattern.title} - ${pattern.sales} sales, $${pattern.revenue.toFixed(2)} revenue</li>`
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
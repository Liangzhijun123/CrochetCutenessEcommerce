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

    // Get purchases with pattern and user data
    const { data: purchases } = await supabaseAdmin
      .from('purchases')
      .select('*, patterns!inner(title, category, difficulty_level, price, creator_id), users!purchases_user_id_fkey(full_name, email)')
      .eq('patterns.creator_id', sellerId)
      .gte('purchased_at', startDate.toISOString())
      .order('purchased_at', { ascending: false })

    const analyticsRows = (purchases || []).map((p: any) => ({
      date: p.purchased_at,
      pattern_title: p.patterns?.title || '',
      category: p.patterns?.category || '',
      difficulty: p.patterns?.difficulty_level || '',
      price: p.patterns?.price || 0,
      sale_amount: p.amount_paid || 0,
      commission: p.creator_commission || 0,
      platform_fee: p.platform_fee || 0,
      customer_name: p.users?.full_name || '',
      customer_email: p.users?.email || '',
      payment_method: p.payment_method || '',
      transaction_id: p.transaction_id || '',
    }))

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
      ...analyticsRows.map(row => [
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
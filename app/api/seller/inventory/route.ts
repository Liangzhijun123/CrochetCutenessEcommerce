import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        error: 'Seller ID is required'
      }, { status: 400 })
    }

    const db = await getDb()

    // Get inventory items with performance data
    const inventoryQuery = `
      SELECT 
        p.id,
        p.title,
        CONCAT('PAT-', p.id) as sku,
        p.category,
        p.difficulty_level as difficulty,
        p.price,
        CASE 
          WHEN p.is_archived THEN 'archived'
          WHEN p.is_draft THEN 'draft'
          WHEN p.is_active THEN 'active'
          ELSE 'inactive'
        END as status,
        CASE 
          WHEN COALESCE(sales_data.sales_count, 0) > 0 THEN 'in_stock'
          WHEN COALESCE(sales_data.sales_count, 0) = 0 AND p.is_active THEN 'in_stock'
          ELSE 'out_of_stock'
        END as stock_status,
        p.thumbnail_url as thumbnail,
        p.created_at,
        p.updated_at,
        COALESCE(sales_data.sales_count, 0) as sales_count,
        COALESCE(sales_data.revenue, 0) as revenue,
        COALESCE(p.views, 0) as views,
        CASE WHEN p.views > 0 THEN (COALESCE(sales_data.sales_count, 0) * 100.0 / p.views) ELSE 0 END as conversion_rate,
        sales_data.last_sale_date,
        true as is_digital,
        COALESCE(sales_data.sales_count, 0) as download_count,
        COALESCE(review_data.rating, 0) as average_rating,
        COALESCE(review_data.review_count, 0) as review_count
      FROM patterns p
      LEFT JOIN (
        SELECT 
          pattern_id,
          COUNT(*) as sales_count,
          SUM(amount_paid) as revenue,
          MAX(purchased_at) as last_sale_date
        FROM purchases
        GROUP BY pattern_id
      ) sales_data ON p.id = sales_data.pattern_id
      LEFT JOIN (
        SELECT 
          pattern_id,
          AVG(rating) as rating,
          COUNT(*) as review_count
        FROM pattern_reviews
        GROUP BY pattern_id
      ) review_data ON p.id = review_data.pattern_id
      WHERE p.creator_id = $1
      ORDER BY p.created_at DESC
    `

    const inventoryResult = await db.query(inventoryQuery, [sellerId])

    const inventory = inventoryResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      sku: row.sku,
      category: row.category,
      difficulty: row.difficulty,
      price: parseFloat(row.price),
      status: row.status,
      stockStatus: row.stock_status,
      thumbnail: row.thumbnail,
      salesCount: parseInt(row.sales_count),
      revenue: parseFloat(row.revenue),
      views: parseInt(row.views),
      conversionRate: parseFloat(row.conversion_rate),
      lastSaleDate: row.last_sale_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isDigital: row.is_digital,
      downloadCount: parseInt(row.download_count),
      averageRating: parseFloat(row.average_rating),
      reviewCount: parseInt(row.review_count),
    }))

    // Calculate stats
    const stats = {
      totalItems: inventory.length,
      activeItems: inventory.filter(item => item.status === 'active').length,
      lowStockItems: inventory.filter(item => item.stockStatus === 'low_stock').length,
      outOfStockItems: inventory.filter(item => item.stockStatus === 'out_of_stock').length,
      totalRevenue: inventory.reduce((sum, item) => sum + item.revenue, 0),
      topPerformer: inventory.length > 0 
        ? inventory.reduce((top, item) => item.revenue > top.revenue ? item : top).title
        : 'No sales yet'
    }

    return NextResponse.json({
      success: true,
      inventory,
      stats,
    })

  } catch (error) {
    console.error('Inventory API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch inventory'
    }, { status: 500 })
  }
}
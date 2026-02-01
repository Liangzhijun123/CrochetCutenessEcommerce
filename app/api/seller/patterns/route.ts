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

    // Get patterns with sales and performance data
    const patternsQuery = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.price,
        p.category,
        p.difficulty_level as difficulty,
        p.is_active,
        CASE 
          WHEN p.is_active THEN 'active'
          ELSE 'inactive'
        END as status,
        p.thumbnail_url as thumbnail,
        p.pattern_file_url,
        p.tutorial_video_url,
        p.created_at,
        p.updated_at,
        COALESCE(sales_data.sales_count, 0) as sales_count,
        COALESCE(sales_data.revenue, 0) as revenue,
        COALESCE(p.views, 0) as views,
        COALESCE(review_data.rating, 0) as rating,
        COALESCE(review_data.review_count, 0) as review_count
      FROM patterns p
      LEFT JOIN (
        SELECT 
          pattern_id,
          COUNT(*) as sales_count,
          SUM(amount_paid) as revenue
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

    const patternsResult = await db.query(patternsQuery, [sellerId])

    const patterns = patternsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      category: row.category,
      difficulty: row.difficulty,
      status: row.status,
      thumbnail: row.thumbnail,
      patternFileUrl: row.pattern_file_url,
      tutorialVideoUrl: row.tutorial_video_url,
      salesCount: parseInt(row.sales_count),
      revenue: parseFloat(row.revenue),
      views: parseInt(row.views),
      rating: parseFloat(row.rating),
      reviewCount: parseInt(row.review_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json({
      success: true,
      patterns,
    })

  } catch (error) {
    console.error('Patterns API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch patterns'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sellerId, title, description, price, category, difficulty, thumbnail, patternFileUrl, tutorialVideoUrl } = body

    if (!sellerId || !title || !price) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    const db = await getDb()

    // Generate SKU
    const sku = `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const insertQuery = `
      INSERT INTO patterns (
        creator_id, title, description, price, category, difficulty_level,
        thumbnail_url, pattern_file_url, tutorial_video_url, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
      RETURNING *
    `

    const result = await db.query(insertQuery, [
      sellerId, title, description, price, category, difficulty,
      thumbnail, patternFileUrl, tutorialVideoUrl
    ])

    const pattern = result.rows[0]

    return NextResponse.json({
      success: true,
      pattern: {
        id: pattern.id,
        title: pattern.title,
        description: pattern.description,
        price: parseFloat(pattern.price),
        category: pattern.category,
        difficulty: pattern.difficulty_level,
        status: pattern.is_active ? 'active' : 'inactive',
        thumbnail: pattern.thumbnail_url,
        patternFileUrl: pattern.pattern_file_url,
        tutorialVideoUrl: pattern.tutorial_video_url,
        salesCount: 0,
        revenue: 0,
        views: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: pattern.created_at,
        updatedAt: pattern.updated_at,
      }
    })

  } catch (error) {
    console.error('Create pattern API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create pattern'
    }, { status: 500 })
  }
}
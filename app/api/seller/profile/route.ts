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

    // Get creator profile
    const profileQuery = `
      SELECT 
        cp.*,
        u.name as user_name,
        u.email as user_email
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.user_id = $1
    `

    const profileResult = await db.query(profileQuery, [sellerId])

    if (profileResult.rows.length === 0) {
      // Create default profile if none exists
      const createProfileQuery = `
        INSERT INTO creator_profiles (
          user_id, display_name, bio, location, website, social_links,
          profile_image, cover_image, brand_colors, specialties, experience,
          achievements, is_public, allow_messages, show_location, show_social_links,
          created_at, updated_at
        ) VALUES (
          $1, '', '', '', '', '{}', '', '', '{"primary": "#f43f5e", "secondary": "#ec4899"}',
          '[]', '', '[]', true, true, true, true, NOW(), NOW()
        )
        RETURNING *
      `

      const createResult = await db.query(createProfileQuery, [sellerId])
      const newProfile = createResult.rows[0]

      // Get stats
      const stats = await getCreatorStats(db, sellerId)

      return NextResponse.json({
        success: true,
        profile: {
          ...newProfile,
          socialLinks: JSON.parse(newProfile.social_links || '{}'),
          brandColors: JSON.parse(newProfile.brand_colors || '{"primary": "#f43f5e", "secondary": "#ec4899"}'),
          specialties: JSON.parse(newProfile.specialties || '[]'),
          achievements: JSON.parse(newProfile.achievements || '[]'),
          stats,
        }
      })
    }

    const profile = profileResult.rows[0]

    // Get stats
    const stats = await getCreatorStats(db, sellerId)

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        userId: profile.user_id,
        displayName: profile.display_name,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        socialLinks: JSON.parse(profile.social_links || '{}'),
        profileImage: profile.profile_image,
        coverImage: profile.cover_image,
        brandColors: JSON.parse(profile.brand_colors || '{"primary": "#f43f5e", "secondary": "#ec4899"}'),
        specialties: JSON.parse(profile.specialties || '[]'),
        experience: profile.experience,
        achievements: JSON.parse(profile.achievements || '[]'),
        isPublic: profile.is_public,
        allowMessages: profile.allow_messages,
        showLocation: profile.show_location,
        showSocialLinks: profile.show_social_links,
        stats,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      }
    })

  } catch (error) {
    console.error('Get profile API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sellerId,
      displayName,
      bio,
      location,
      website,
      socialLinks,
      brandColors,
      specialties,
      experience,
      achievements,
      isPublic,
      allowMessages,
      showLocation,
      showSocialLinks,
    } = body

    if (!sellerId) {
      return NextResponse.json({
        success: false,
        error: 'Seller ID is required'
      }, { status: 400 })
    }

    const db = await getDb()

    // Update or create profile
    const upsertQuery = `
      INSERT INTO creator_profiles (
        user_id, display_name, bio, location, website, social_links,
        brand_colors, specialties, experience, achievements, is_public,
        allow_messages, show_location, show_social_links, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = $2,
        bio = $3,
        location = $4,
        website = $5,
        social_links = $6,
        brand_colors = $7,
        specialties = $8,
        experience = $9,
        achievements = $10,
        is_public = $11,
        allow_messages = $12,
        show_location = $13,
        show_social_links = $14,
        updated_at = NOW()
      RETURNING *
    `

    const result = await db.query(upsertQuery, [
      sellerId,
      displayName,
      bio,
      location,
      website,
      JSON.stringify(socialLinks),
      JSON.stringify(brandColors),
      JSON.stringify(specialties),
      experience,
      JSON.stringify(achievements),
      isPublic,
      allowMessages,
      showLocation,
      showSocialLinks,
    ])

    const profile = result.rows[0]

    // Get updated stats
    const stats = await getCreatorStats(db, sellerId)

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        userId: profile.user_id,
        displayName: profile.display_name,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        socialLinks: JSON.parse(profile.social_links || '{}'),
        profileImage: profile.profile_image,
        coverImage: profile.cover_image,
        brandColors: JSON.parse(profile.brand_colors || '{}'),
        specialties: JSON.parse(profile.specialties || '[]'),
        experience: profile.experience,
        achievements: JSON.parse(profile.achievements || '[]'),
        isPublic: profile.is_public,
        allowMessages: profile.allow_messages,
        showLocation: profile.show_location,
        showSocialLinks: profile.show_social_links,
        stats,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      }
    })

  } catch (error) {
    console.error('Update profile API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile'
    }, { status: 500 })
  }
}

async function getCreatorStats(db: any, sellerId: string) {
  const statsQuery = `
    SELECT 
      COALESCE(SUM(p.amount_paid), 0) as total_revenue,
      COUNT(p.id) as total_sales,
      COALESCE(AVG(pr.rating), 0) as average_rating,
      COUNT(pr.id) as total_reviews,
      0 as followers,
      COUNT(DISTINCT pt.id) as patterns_published
    FROM patterns pt
    LEFT JOIN purchases p ON pt.id = p.pattern_id
    LEFT JOIN pattern_reviews pr ON pt.id = pr.pattern_id
    WHERE pt.creator_id = $1
  `

  const statsResult = await db.query(statsQuery, [sellerId])
  const stats = statsResult.rows[0]

  return {
    totalSales: parseInt(stats.total_sales),
    totalRevenue: parseFloat(stats.total_revenue),
    averageRating: parseFloat(stats.average_rating),
    totalReviews: parseInt(stats.total_reviews),
    followers: parseInt(stats.followers),
    patternsPublished: parseInt(stats.patterns_published),
  }
}
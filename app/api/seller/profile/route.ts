import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'Seller ID is required' }, { status: 400 })
    }

    // Get creator profile
    const { data: profile, error } = await supabaseAdmin
      .from('creator_profiles')
      .select('*')
      .eq('user_id', sellerId)
      .single()

    if (error || !profile) {
      // Create default profile
      const { data: newProfile, error: createErr } = await supabaseAdmin
        .from('creator_profiles')
        .insert({ user_id: sellerId })
        .select()
        .single()

      if (createErr) {
        return NextResponse.json({ success: false, error: 'Failed to create profile' }, { status: 500 })
      }

      const stats = await getCreatorStats(sellerId)

      return NextResponse.json({
        success: true,
        profile: {
          ...formatProfile(newProfile),
          stats,
        }
      })
    }

    const stats = await getCreatorStats(sellerId)

    return NextResponse.json({
      success: true,
      profile: {
        ...formatProfile(profile),
        stats,
      }
    })

  } catch (error) {
    console.error('Get profile API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 })
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
      // Also support settings update
      shopName,
      shopDescription,
    } = body

    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'Seller ID is required' }, { status: 400 })
    }

    // Update seller shop info if provided
    if (shopName || shopDescription) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('seller_id')
        .eq('id', sellerId)
        .single()

      if (userData?.seller_id) {
        const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
        if (shopName) updateData.shop_name = shopName
        if (shopDescription) updateData.shop_description = shopDescription

        await supabaseAdmin
          .from('sellers')
          .update(updateData)
          .eq('id', userData.seller_id)
      }
    }

    // Upsert creator profile
    const profileData: Record<string, any> = {
      user_id: sellerId,
      updated_at: new Date().toISOString(),
    }
    if (displayName !== undefined) profileData.display_name = displayName
    if (bio !== undefined) profileData.bio = bio
    if (location !== undefined) profileData.location = location
    if (website !== undefined) profileData.website = website
    if (socialLinks !== undefined) profileData.social_links = socialLinks
    if (brandColors !== undefined) profileData.brand_colors = brandColors
    if (specialties !== undefined) profileData.specialties = specialties
    if (experience !== undefined) profileData.experience = experience
    if (achievements !== undefined) profileData.achievements = achievements
    if (isPublic !== undefined) profileData.is_public = isPublic
    if (allowMessages !== undefined) profileData.allow_messages = allowMessages
    if (showLocation !== undefined) profileData.show_location = showLocation
    if (showSocialLinks !== undefined) profileData.show_social_links = showSocialLinks

    const { data: profile, error } = await supabaseAdmin
      .from('creator_profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
    }

    const stats = await getCreatorStats(sellerId)

    return NextResponse.json({
      success: true,
      profile: {
        ...formatProfile(profile),
        stats,
      }
    })

  } catch (error) {
    console.error('Update profile API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}

function formatProfile(profile: any) {
  return {
    id: profile.id,
    userId: profile.user_id,
    displayName: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    socialLinks: profile.social_links || {},
    profileImage: profile.profile_image || '',
    coverImage: profile.cover_image || '',
    brandColors: profile.brand_colors || { primary: '#f43f5e', secondary: '#ec4899' },
    specialties: profile.specialties || [],
    experience: profile.experience || '',
    achievements: profile.achievements || [],
    isPublic: profile.is_public ?? true,
    allowMessages: profile.allow_messages ?? true,
    showLocation: profile.show_location ?? true,
    showSocialLinks: profile.show_social_links ?? true,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

async function getCreatorStats(sellerId: string) {
  const { data: patterns } = await supabaseAdmin
    .from('patterns')
    .select('id')
    .eq('creator_id', sellerId)

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, views')
    .eq('seller_id', sellerId)

  const allItemIds = [
    ...(patterns || []).map(p => p.id),
    ...(products || []).map(p => p.id),
  ]

  let totalSales = 0
  let totalRevenue = 0

  if (allItemIds.length > 0) {
    const { data: purchases } = await supabaseAdmin
      .from('purchases')
      .select('id, amount_paid')
      .in('pattern_id', allItemIds)

    totalSales = (purchases || []).length
    totalRevenue = (purchases || []).reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0)
  }

  return {
    totalSales,
    totalRevenue,
    averageRating: 0,
    totalReviews: 0,
    followers: 0,
    patternsPublished: (patterns || []).length + (products || []).length,
  }
}
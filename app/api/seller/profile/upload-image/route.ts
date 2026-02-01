import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mock-db-adapter'
import { uploadFile } from '@/lib/file-storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'profile' or 'cover'
    const sellerId = formData.get('sellerId') as string

    if (!file || !type || !sellerId) {
      return NextResponse.json({
        success: false,
        error: 'File, type, and seller ID are required'
      }, { status: 400 })
    }

    if (!['profile', 'cover'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid image type'
      }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'File must be an image'
      }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File size must be less than 5MB'
      }, { status: 400 })
    }

    // Upload file
    const fileName = `seller-${sellerId}-${type}-${Date.now()}.${file.name.split('.').pop()}`
    const imageUrl = await uploadFile(file, `profiles/${fileName}`)

    // Update database
    const db = await getDb()
    const columnName = type === 'profile' ? 'profile_image' : 'cover_image'
    
    const updateQuery = `
      UPDATE creator_profiles 
      SET ${columnName} = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING *
    `

    const result = await db.query(updateQuery, [imageUrl, sellerId])

    if (result.rows.length === 0) {
      // Create profile if it doesn't exist
      const createQuery = `
        INSERT INTO creator_profiles (
          user_id, ${columnName}, created_at, updated_at
        ) VALUES ($1, $2, NOW(), NOW())
        RETURNING *
      `
      await db.query(createQuery, [sellerId, imageUrl])
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: `${type === 'profile' ? 'Profile' : 'Cover'} image uploaded successfully`
    })

  } catch (error) {
    console.error('Upload image API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to upload image'
    }, { status: 500 })
  }
}
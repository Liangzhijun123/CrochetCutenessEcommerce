import { type NextRequest, NextResponse } from "next/server"
import { cdnService } from "@/lib/cdn-config"
import sharp from 'sharp'
import { fileStorageService } from "@/lib/file-storage"

// Optimize images on-the-fly or batch process
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      imageUrl, 
      width, 
      height, 
      quality = 85, 
      format = 'webp',
      fit = 'cover'
    } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    // Validate parameters
    if (width && (width < 1 || width > 2000)) {
      return NextResponse.json(
        { error: "Width must be between 1 and 2000 pixels" },
        { status: 400 }
      )
    }

    if (height && (height < 1 || height > 2000)) {
      return NextResponse.json(
        { error: "Height must be between 1 and 2000 pixels" },
        { status: 400 }
      )
    }

    if (quality < 1 || quality > 100) {
      return NextResponse.json(
        { error: "Quality must be between 1 and 100" },
        { status: 400 }
      )
    }

    // Generate optimized URL using CDN service
    const optimizedUrl = cdnService.getOptimizedImageUrl(imageUrl, {
      width,
      height,
      quality,
      format: format as 'webp' | 'jpeg' | 'png',
      fit: fit as 'cover' | 'contain' | 'fill'
    })

    // Also generate responsive variants
    const responsiveUrls = cdnService.getResponsiveImageUrls(imageUrl)

    return NextResponse.json({
      success: true,
      optimizedUrl,
      responsiveUrls,
      srcSet: cdnService.generateSrcSet(imageUrl),
      originalUrl: imageUrl,
      optimizations: {
        width,
        height,
        quality,
        format,
        fit
      }
    })

  } catch (error) {
    console.error("Error optimizing image:", error)
    return NextResponse.json(
      { error: "Failed to optimize image" },
      { status: 500 }
    )
  }
}

// Batch optimize multiple images
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      imageUrls, 
      width, 
      height, 
      quality = 85, 
      format = 'webp',
      fit = 'cover'
    } = body

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Image URLs array is required" },
        { status: 400 }
      )
    }

    if (imageUrls.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 images can be optimized at once" },
        { status: 400 }
      )
    }

    const optimizedImages = imageUrls.map((imageUrl: string) => {
      try {
        const optimizedUrl = cdnService.getOptimizedImageUrl(imageUrl, {
          width,
          height,
          quality,
          format: format as 'webp' | 'jpeg' | 'png',
          fit: fit as 'cover' | 'contain' | 'fill'
        })

        const responsiveUrls = cdnService.getResponsiveImageUrls(imageUrl)

        return {
          originalUrl: imageUrl,
          optimizedUrl,
          responsiveUrls,
          srcSet: cdnService.generateSrcSet(imageUrl),
          success: true
        }
      } catch (error) {
        return {
          originalUrl: imageUrl,
          success: false,
          error: 'Failed to optimize image'
        }
      }
    })

    const successCount = optimizedImages.filter(img => img.success).length

    return NextResponse.json({
      success: successCount === imageUrls.length,
      optimizedImages,
      summary: {
        total: imageUrls.length,
        successful: successCount,
        failed: imageUrls.length - successCount
      },
      optimizations: {
        width,
        height,
        quality,
        format,
        fit
      }
    })

  } catch (error) {
    console.error("Error batch optimizing images:", error)
    return NextResponse.json(
      { error: "Failed to optimize images" },
      { status: 500 }
    )
  }
}

// Generate thumbnails for existing images
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, sizes = ['small', 'medium', 'large'] } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      )
    }

    const thumbnails: { [key: string]: string } = {}

    for (const size of sizes) {
      if (['small', 'medium', 'large'].includes(size)) {
        thumbnails[size] = cdnService.getThumbnailUrl(imageUrl, size as 'small' | 'medium' | 'large')
      }
    }

    return NextResponse.json({
      success: true,
      originalUrl: imageUrl,
      thumbnails,
      availableSizes: ['small', 'medium', 'large']
    })

  } catch (error) {
    console.error("Error generating thumbnails:", error)
    return NextResponse.json(
      { error: "Failed to generate thumbnails" },
      { status: 500 }
    )
  }
}
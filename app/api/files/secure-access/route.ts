import { type NextRequest, NextResponse } from "next/server"
import { fileStorageService } from "@/lib/file-storage"

// Generate secure signed URLs for file access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrl, expiresIn = 3600 } = body

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      )
    }

    // Validate expiration time (max 24 hours)
    const maxExpiresIn = 24 * 60 * 60 // 24 hours in seconds
    const validExpiresIn = Math.min(Math.max(expiresIn, 300), maxExpiresIn) // Min 5 minutes, max 24 hours

    try {
      // Extract S3 key from the file URL
      const fileKey = fileStorageService.extractKeyFromUrl(fileUrl)
      
      // Generate signed URL
      const signedUrl = await fileStorageService.getSignedUrl(fileKey, validExpiresIn)

      return NextResponse.json({
        success: true,
        signedUrl,
        expiresIn: validExpiresIn,
        expiresAt: new Date(Date.now() + validExpiresIn * 1000).toISOString()
      })

    } catch (error) {
      console.error("Error generating signed URL:", error)
      
      // If file storage is not configured, return the original URL
      if (!fileStorageService.isConfigured()) {
        return NextResponse.json({
          success: true,
          signedUrl: fileUrl,
          expiresIn: validExpiresIn,
          expiresAt: new Date(Date.now() + validExpiresIn * 1000).toISOString(),
          mock: true
        })
      }

      return NextResponse.json(
        { error: "Failed to generate secure access URL" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Error processing secure access request:", error)
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    )
  }
}

// Batch generate signed URLs for multiple files
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrls, expiresIn = 3600 } = body

    if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
      return NextResponse.json(
        { error: "File URLs array is required" },
        { status: 400 }
      )
    }

    if (fileUrls.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 files can be processed at once" },
        { status: 400 }
      )
    }

    // Validate expiration time
    const maxExpiresIn = 24 * 60 * 60
    const validExpiresIn = Math.min(Math.max(expiresIn, 300), maxExpiresIn)

    const results = await Promise.allSettled(
      fileUrls.map(async (fileUrl: string) => {
        try {
          const fileKey = fileStorageService.extractKeyFromUrl(fileUrl)
          const signedUrl = await fileStorageService.getSignedUrl(fileKey, validExpiresIn)
          
          return {
            originalUrl: fileUrl,
            signedUrl,
            success: true
          }
        } catch (error) {
          return {
            originalUrl: fileUrl,
            signedUrl: fileStorageService.isConfigured() ? null : fileUrl,
            success: !fileStorageService.isConfigured(),
            error: fileStorageService.isConfigured() ? 'Failed to generate signed URL' : undefined,
            mock: !fileStorageService.isConfigured()
          }
        }
      })
    )

    const signedUrls = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          originalUrl: fileUrls[index],
          signedUrl: null,
          success: false,
          error: 'Failed to process file URL'
        }
      }
    })

    return NextResponse.json({
      success: true,
      signedUrls,
      expiresIn: validExpiresIn,
      expiresAt: new Date(Date.now() + validExpiresIn * 1000).toISOString()
    })

  } catch (error) {
    console.error("Error processing batch secure access request:", error)
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    )
  }
}
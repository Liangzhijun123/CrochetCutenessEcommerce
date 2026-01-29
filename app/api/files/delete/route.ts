import { type NextRequest, NextResponse } from "next/server"
import { fileStorageService } from "@/lib/file-storage"

// Delete files from cloud storage
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrl, creatorId } = body

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 }
      )
    }

    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is required for authorization" },
        { status: 400 }
      )
    }

    // TODO: Add proper authentication and authorization
    // Verify that the requesting user is the creator or has admin privileges

    try {
      // Extract S3 key from the file URL
      const fileKey = fileStorageService.extractKeyFromUrl(fileUrl)
      
      // Verify the file belongs to the creator (basic security check)
      if (!fileKey.includes(creatorId)) {
        return NextResponse.json(
          { error: "Unauthorized: File does not belong to the specified creator" },
          { status: 403 }
        )
      }

      // Delete file from storage
      await fileStorageService.deleteFile(fileKey)

      // Also try to delete associated thumbnail if it exists
      try {
        const thumbnailKey = fileKey.replace(/^(patterns|videos|images)\//, 'thumbnails/')
          .replace(/\.[^.]+$/, '_thumb.jpg')
        await fileStorageService.deleteFile(thumbnailKey)
      } catch (thumbnailError) {
        // Thumbnail deletion is not critical, continue
        console.warn('Failed to delete thumbnail:', thumbnailError)
      }

      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
        deletedFile: fileUrl
      })

    } catch (error) {
      console.error("Error deleting file:", error)
      
      // If file storage is not configured, return success (mock)
      if (!fileStorageService.isConfigured()) {
        return NextResponse.json({
          success: true,
          message: "File deleted successfully (mock)",
          deletedFile: fileUrl,
          mock: true
        })
      }

      return NextResponse.json(
        { error: "Failed to delete file from storage" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Error processing file deletion request:", error)
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    )
  }
}

// Batch delete multiple files
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileUrls, creatorId } = body

    if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
      return NextResponse.json(
        { error: "File URLs array is required" },
        { status: 400 }
      )
    }

    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is required for authorization" },
        { status: 400 }
      )
    }

    if (fileUrls.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 files can be deleted at once" },
        { status: 400 }
      )
    }

    const results = await Promise.allSettled(
      fileUrls.map(async (fileUrl: string) => {
        try {
          const fileKey = fileStorageService.extractKeyFromUrl(fileUrl)
          
          // Verify the file belongs to the creator
          if (!fileKey.includes(creatorId)) {
            throw new Error("Unauthorized: File does not belong to the specified creator")
          }

          await fileStorageService.deleteFile(fileKey)
          
          // Try to delete thumbnail
          try {
            const thumbnailKey = fileKey.replace(/^(patterns|videos|images)\//, 'thumbnails/')
              .replace(/\.[^.]+$/, '_thumb.jpg')
            await fileStorageService.deleteFile(thumbnailKey)
          } catch (thumbnailError) {
            // Thumbnail deletion is not critical
          }

          return {
            fileUrl,
            success: true,
            message: "File deleted successfully"
          }
        } catch (error) {
          return {
            fileUrl,
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete file'
          }
        }
      })
    )

    const deletionResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          fileUrl: fileUrls[index],
          success: false,
          error: 'Failed to process file deletion'
        }
      }
    })

    const successCount = deletionResults.filter(result => result.success).length
    const failureCount = deletionResults.length - successCount

    return NextResponse.json({
      success: failureCount === 0,
      message: `${successCount} files deleted successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results: deletionResults,
      summary: {
        total: deletionResults.length,
        successful: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error("Error processing batch file deletion request:", error)
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    )
  }
}
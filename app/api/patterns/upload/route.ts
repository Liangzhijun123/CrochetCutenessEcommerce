import { type NextRequest, NextResponse } from "next/server"
import { fileStorageService } from "@/lib/file-storage"
import { parseFormData, validateRequiredFields } from "@/lib/file-upload-utils"

// File upload endpoint for pattern files, videos, and thumbnails
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const { files, fields } = await parseFormData(request)
    
    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields(fields, ['type', 'creatorId'])
    if (!requiredFieldsValidation.valid) {
      return NextResponse.json(
        { error: `Missing required fields: ${requiredFieldsValidation.missingFields?.join(', ')}` },
        { status: 400 }
      )
    }

    const file = files.file
    const fileType = fields.type
    const creatorId = fields.creatorId

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" }, 
        { status: 400 }
      )
    }

    if (!["pattern", "video", "thumbnail", "image"].includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Must be 'pattern', 'video', 'thumbnail', or 'image'" }, 
        { status: 400 }
      )
    }

    // Validate file using the storage service
    const validation = fileStorageService.validateFile(file, fileType)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error }, 
        { status: 400 }
      )
    }

    // Check if file storage is properly configured
    if (!fileStorageService.isConfigured()) {
      // Fallback to mock implementation for development
      console.warn('File storage not configured, using mock implementation')
      const mockUrl = generateMockFileUrl(file.name, fileType, creatorId)
      
      return NextResponse.json({
        success: true,
        fileUrl: mockUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: fileType,
        uploadedAt: new Date().toISOString(),
        mock: true
      })
    }

    // Upload file to cloud storage
    const uploadResult = await fileStorageService.uploadFile({
      fileType: fileType as 'pattern' | 'video' | 'thumbnail' | 'image',
      creatorId,
      originalName: file.name,
      buffer: file.buffer,
      mimeType: file.type
    })

    return NextResponse.json({
      success: true,
      ...uploadResult
    })

  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "An error occurred while uploading the file" }, 
      { status: 500 }
    )
  }
}

function generateMockFileUrl(fileName: string, fileType: string, creatorId: string): string {
  // In production, this would be the actual cloud storage URL
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  return `https://cdn.crochet-platform.com/${fileType}s/${creatorId}/${timestamp}_${sanitizedFileName}`
}

// Additional endpoint for getting upload progress (for large files)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const uploadId = searchParams.get("uploadId")

  if (!uploadId) {
    return NextResponse.json(
      { error: "Upload ID is required" }, 
      { status: 400 }
    )
  }

  // In a real implementation, you would check the upload progress
  // from your cloud storage provider
  return NextResponse.json({
    uploadId,
    progress: 100, // Mock completed upload
    status: "completed"
  })
}
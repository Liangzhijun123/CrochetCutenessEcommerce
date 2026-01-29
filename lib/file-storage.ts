import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export interface FileUploadOptions {
  fileType: 'pattern' | 'video' | 'thumbnail' | 'image'
  creatorId: string
  originalName: string
  buffer: Buffer
  mimeType: string
}

export interface FileUploadResult {
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  thumbnailUrl?: string
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

class FileStorageService {
  private s3Client: S3Client
  private bucketName: string
  private cdnDomain: string

  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })

    this.bucketName = process.env.AWS_S3_BUCKET || 'crochet-community-files'
    this.cdnDomain = process.env.CDN_DOMAIN || `https://${this.bucketName}.s3.amazonaws.com`
  }

  /**
   * Validate file based on type, size, and format
   */
  public validateFile(file: File | { size: number; type: string; name: string }, fileType: string): FileValidationResult {
    const maxSizes = {
      pattern: 10 * 1024 * 1024, // 10MB for pattern PDFs
      video: 200 * 1024 * 1024,  // 200MB for tutorial videos
      thumbnail: 5 * 1024 * 1024, // 5MB for thumbnails
      image: 5 * 1024 * 1024      // 5MB for general images
    }

    const allowedTypes = {
      pattern: [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      video: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
        'video/quicktime'
      ],
      thumbnail: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
      ],
      image: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/svg+xml'
      ]
    }

    // Check file size
    const maxSize = maxSizes[fileType as keyof typeof maxSizes]
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return {
        valid: false,
        error: `File size too large. Maximum size for ${fileType} files is ${maxSizeMB}MB`
      }
    }

    // Check file type
    const allowedMimeTypes = allowedTypes[fileType as keyof typeof allowedTypes]
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types for ${fileType}: ${allowedMimeTypes.join(', ')}`
      }
    }

    // Additional validation for specific file types
    const fileExtensions = {
      pattern: /\.(pdf|txt|doc|docx)$/i,
      video: /\.(mp4|webm|ogg|avi|mov)$/i,
      thumbnail: /\.(jpg|jpeg|png|webp|gif)$/i,
      image: /\.(jpg|jpeg|png|webp|gif|svg)$/i
    }

    const expectedExtension = fileExtensions[fileType as keyof typeof fileExtensions]
    if (!file.name.match(expectedExtension)) {
      return {
        valid: false,
        error: `Invalid file extension for ${fileType} files`
      }
    }

    return { valid: true }
  }

  /**
   * Generate optimized thumbnails for images and videos
   */
  private async generateThumbnail(buffer: Buffer, mimeType: string): Promise<Buffer> {
    if (mimeType.startsWith('image/')) {
      // Generate optimized thumbnail for images
      return await sharp(buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer()
    }

    // For videos, we would need a video processing library like ffmpeg
    // For now, return a placeholder thumbnail
    return await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 255, g: 192, b: 203 } // Pink background
      }
    })
    .jpeg({ quality: 80 })
    .toBuffer()
  }

  /**
   * Upload file to S3 with proper organization and optimization
   */
  public async uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
    const { fileType, creatorId, originalName, buffer, mimeType } = options

    // Generate unique filename
    const fileId = uuidv4()
    const timestamp = Date.now()
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${fileId}_${sanitizedName}`

    // Organize files by type and creator
    const s3Key = `${fileType}s/${creatorId}/${fileName}`

    try {
      // Upload main file
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: {
          originalName: originalName,
          creatorId: creatorId,
          fileType: fileType,
          uploadedAt: new Date().toISOString()
        }
      })

      await this.s3Client.send(uploadCommand)

      const fileUrl = `${this.cdnDomain}/${s3Key}`
      let thumbnailUrl: string | undefined

      // Generate and upload thumbnail for images and videos
      if (fileType === 'image' || fileType === 'video' || fileType === 'thumbnail') {
        try {
          const thumbnailBuffer = await this.generateThumbnail(buffer, mimeType)
          const thumbnailKey = `thumbnails/${creatorId}/${timestamp}_${fileId}_thumb.jpg`

          const thumbnailCommand = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentType: 'image/jpeg',
            Metadata: {
              originalFile: s3Key,
              creatorId: creatorId,
              generatedAt: new Date().toISOString()
            }
          })

          await this.s3Client.send(thumbnailCommand)
          thumbnailUrl = `${this.cdnDomain}/${thumbnailKey}`
        } catch (thumbnailError) {
          console.warn('Failed to generate thumbnail:', thumbnailError)
          // Continue without thumbnail - not critical
        }
      }

      return {
        fileUrl,
        fileName: sanitizedName,
        fileSize: buffer.length,
        fileType,
        uploadedAt: new Date().toISOString(),
        thumbnailUrl
      }

    } catch (error) {
      console.error('Error uploading file to S3:', error)
      throw new Error('Failed to upload file to storage')
    }
  }

  /**
   * Generate signed URL for secure file access
   */
  public async getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey
      })

      return await getSignedUrl(this.s3Client, command, { expiresIn })
    } catch (error) {
      console.error('Error generating signed URL:', error)
      throw new Error('Failed to generate secure file access URL')
    }
  }

  /**
   * Delete file from S3
   */
  public async deleteFile(fileKey: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey
      })

      await this.s3Client.send(deleteCommand)
    } catch (error) {
      console.error('Error deleting file from S3:', error)
      throw new Error('Failed to delete file from storage')
    }
  }

  /**
   * Extract S3 key from full URL
   */
  public extractKeyFromUrl(fileUrl: string): string {
    const url = new URL(fileUrl)
    return url.pathname.substring(1) // Remove leading slash
  }

  /**
   * Check if file storage is properly configured
   */
  public isConfigured(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET
    )
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService()
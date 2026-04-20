import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const BUCKET_NAME = 'files'

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
  private supabase

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  }

  /**
   * Validate file based on type, size, and format
   */
  public validateFile(file: File | { size: number; type: string; name: string }, fileType: string): FileValidationResult {
    const maxSizes: Record<string, number> = {
      pattern: 10 * 1024 * 1024,
      video: 200 * 1024 * 1024,
      thumbnail: 5 * 1024 * 1024,
      image: 5 * 1024 * 1024
    }

    const allowedTypes: Record<string, string[]> = {
      pattern: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'],
      thumbnail: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    }

    const maxSize = maxSizes[fileType]
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return { valid: false, error: `File size too large. Maximum size for ${fileType} files is ${maxSizeMB}MB` }
    }

    const allowedMimeTypes = allowedTypes[fileType]
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.type)) {
      return { valid: false, error: `Invalid file type. Allowed types for ${fileType}: ${allowedMimeTypes.join(', ')}` }
    }

    return { valid: true }
  }

  /**
   * Upload file to Supabase Storage
   */
  public async uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
    const { fileType, creatorId, originalName, buffer, mimeType } = options

    const fileId = uuidv4()
    const timestamp = Date.now()
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${fileId}_${sanitizedName}`
    const storagePath = `${fileType}s/${creatorId}/${fileName}`

    const { data, error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (error) {
      console.error('Error uploading file to Supabase Storage:', error)
      throw new Error('Failed to upload file to storage')
    }

    const { data: urlData } = this.supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      fileUrl: urlData.publicUrl,
      fileName: sanitizedName,
      fileSize: buffer.length,
      fileType,
      uploadedAt: new Date().toISOString(),
    }
  }

  /**
   * Generate signed URL for secure/temporary file access
   */
  public async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Error generating signed URL:', error)
      throw new Error('Failed to generate secure file access URL')
    }

    return data.signedUrl
  }

  /**
   * Delete file from Supabase Storage
   */
  public async deleteFile(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file from storage:', error)
      throw new Error('Failed to delete file from storage')
    }
  }

  /**
   * Extract storage path from full public URL
   */
  public extractKeyFromUrl(fileUrl: string): string {
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
    const idx = fileUrl.indexOf(marker)
    if (idx !== -1) {
      return fileUrl.substring(idx + marker.length)
    }
    // Fallback: try to get last path segments
    const url = new URL(fileUrl)
    return url.pathname.substring(1)
  }

  /**
   * Check if file storage is properly configured
   */
  public isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService()

// Convenience function for simple file uploads (used by seller profile image upload etc.)
export async function uploadFile(file: File, storagePath: string): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
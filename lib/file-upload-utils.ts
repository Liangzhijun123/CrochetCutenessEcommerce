import { NextRequest } from 'next/server'

export interface ParsedFile {
  name: string
  type: string
  size: number
  buffer: Buffer
}

export interface ParsedFormData {
  files: { [key: string]: ParsedFile }
  fields: { [key: string]: string }
}

/**
 * Parse multipart form data from NextRequest
 * This is a utility to handle file uploads in Next.js API routes
 */
export async function parseFormData(request: NextRequest): Promise<ParsedFormData> {
  const formData = await request.formData()
  const files: { [key: string]: ParsedFile } = {}
  const fields: { [key: string]: string } = {}

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      // Handle file
      const buffer = Buffer.from(await value.arrayBuffer())
      files[key] = {
        name: value.name,
        type: value.type,
        size: value.size,
        buffer
      }
    } else {
      // Handle regular field
      fields[key] = value as string
    }
  }

  return { files, fields }
}

/**
 * Validate required fields in form data
 */
export function validateRequiredFields(
  fields: { [key: string]: string },
  requiredFields: string[]
): { valid: boolean; missingFields?: string[] } {
  const missingFields = requiredFields.filter(field => !fields[field])
  
  if (missingFields.length > 0) {
    return { valid: false, missingFields }
  }
  
  return { valid: true }
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot !== -1 ? fileName.substring(lastDot + 1).toLowerCase() : ''
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const sanitized = sanitizeFileName(originalName)
  const extension = getFileExtension(sanitized)
  const nameWithoutExt = sanitized.replace(`.${extension}`, '')
  
  const parts = [
    prefix,
    timestamp,
    randomSuffix,
    nameWithoutExt
  ].filter(Boolean)
  
  return `${parts.join('_')}.${extension}`
}

/**
 * Convert bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if file type is supported for a given category
 */
export function isSupportedFileType(mimeType: string, category: 'image' | 'video' | 'document'): boolean {
  const supportedTypes = {
    image: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ],
    video: [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/quicktime'
    ],
    document: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
  
  return supportedTypes[category].includes(mimeType)
}

/**
 * Extract metadata from file buffer (basic implementation)
 */
export async function extractFileMetadata(buffer: Buffer, mimeType: string): Promise<{
  dimensions?: { width: number; height: number }
  duration?: number
  pages?: number
}> {
  const metadata: any = {}
  
  // For images, we could use sharp to get dimensions
  if (mimeType.startsWith('image/')) {
    try {
      const sharp = require('sharp')
      const imageMetadata = await sharp(buffer).metadata()
      metadata.dimensions = {
        width: imageMetadata.width || 0,
        height: imageMetadata.height || 0
      }
    } catch (error) {
      console.warn('Failed to extract image metadata:', error)
    }
  }
  
  // For videos and documents, we would need additional libraries
  // This is a placeholder for future implementation
  
  return metadata
}
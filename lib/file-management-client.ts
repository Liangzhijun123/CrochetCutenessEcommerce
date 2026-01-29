/**
 * Client-side file management utilities
 * Handles file uploads, optimization, and CDN integration from the frontend
 */

export interface FileUploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface FileUploadResult {
  success: boolean
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  uploadedAt?: string
  thumbnailUrl?: string
  error?: string
  mock?: boolean
}

export interface OptimizedImageUrls {
  small: string
  medium: string
  large: string
  original: string
}

class FileManagementClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  }

  /**
   * Upload a single file with progress tracking
   */
  public async uploadFile(
    file: File,
    fileType: 'pattern' | 'video' | 'thumbnail' | 'image',
    creatorId: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', fileType)
      formData.append('creatorId', creatorId)

      const xhr = new XMLHttpRequest()

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: FileUploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            }
            onProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          try {
            const response = JSON.parse(xhr.responseText)
            if (xhr.status === 200) {
              resolve(response)
            } else {
              resolve({
                success: false,
                error: response.error || 'Upload failed'
              })
            }
          } catch (error) {
            resolve({
              success: false,
              error: 'Invalid response from server'
            })
          }
        })

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Network error during upload'
          })
        })

        xhr.open('POST', `${this.baseUrl}/api/patterns/upload`)
        xhr.send(formData)
      })

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * Upload multiple files with batch progress tracking
   */
  public async uploadMultipleFiles(
    files: File[],
    fileType: 'pattern' | 'video' | 'thumbnail' | 'image',
    creatorId: string,
    onProgress?: (fileIndex: number, progress: FileUploadProgress) => void
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = await this.uploadFile(
        file,
        fileType,
        creatorId,
        onProgress ? (progress) => onProgress(i, progress) : undefined
      )
      results.push(result)
    }

    return results
  }

  /**
   * Get secure signed URL for file access
   */
  public async getSecureFileUrl(
    fileUrl: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/files/secure-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl, expiresIn })
      })

      const result = await response.json()
      return result

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get secure URL'
      }
    }
  }

  /**
   * Get batch secure URLs for multiple files
   */
  public async getBatchSecureUrls(
    fileUrls: string[],
    expiresIn: number = 3600
  ): Promise<{ success: boolean; signedUrls?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/files/secure-access`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrls, expiresIn })
      })

      const result = await response.json()
      return result

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get secure URLs'
      }
    }
  }

  /**
   * Delete a file from storage
   */
  public async deleteFile(
    fileUrl: string,
    creatorId: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/files/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl, creatorId })
      })

      const result = await response.json()
      return result

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      }
    }
  }

  /**
   * Get optimized image URLs
   */
  public async getOptimizedImageUrls(
    imageUrl: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'jpeg' | 'png'
      fit?: 'cover' | 'contain' | 'fill'
    } = {}
  ): Promise<{
    success: boolean
    optimizedUrl?: string
    responsiveUrls?: OptimizedImageUrls
    srcSet?: string
    error?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/files/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, ...options })
      })

      const result = await response.json()
      return result

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize image'
      }
    }
  }

  /**
   * Validate file before upload
   */
  public validateFile(
    file: File,
    fileType: 'pattern' | 'video' | 'thumbnail' | 'image'
  ): { valid: boolean; error?: string } {
    const maxSizes = {
      pattern: 10 * 1024 * 1024, // 10MB
      video: 200 * 1024 * 1024,  // 200MB
      thumbnail: 5 * 1024 * 1024, // 5MB
      image: 5 * 1024 * 1024      // 5MB
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
    const maxSize = maxSizes[fileType]
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return {
        valid: false,
        error: `File size too large. Maximum size for ${fileType} files is ${maxSizeMB}MB`
      }
    }

    // Check file type
    const allowedMimeTypes = allowedTypes[fileType]
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
      }
    }

    return { valid: true }
  }

  /**
   * Format file size for display
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Generate preview URL for file
   */
  public generatePreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      } else {
        resolve('/placeholder.svg?height=200&width=200')
      }
    })
  }
}

// Export singleton instance
export const fileManagementClient = new FileManagementClient()
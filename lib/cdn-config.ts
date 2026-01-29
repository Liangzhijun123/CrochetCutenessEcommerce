/**
 * CDN Configuration and URL generation utilities
 * Handles CloudFront or other CDN integration for fast content delivery
 */

export interface CDNConfig {
  domain: string
  region: string
  cacheTTL: number
  enableCompression: boolean
  enableWebP: boolean
}

export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  fit?: 'cover' | 'contain' | 'fill'
}

class CDNService {
  private config: CDNConfig

  constructor() {
    this.config = {
      domain: process.env.CDN_DOMAIN || process.env.AWS_S3_BUCKET ? 
        `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com` : 
        'https://cdn.crochet-platform.com',
      region: process.env.AWS_REGION || 'us-east-1',
      cacheTTL: parseInt(process.env.CDN_CACHE_TTL || '86400'), // 24 hours default
      enableCompression: process.env.CDN_COMPRESSION !== 'false',
      enableWebP: process.env.CDN_WEBP !== 'false'
    }
  }

  /**
   * Generate optimized CDN URL for images with transformation parameters
   */
  public getOptimizedImageUrl(
    originalUrl: string, 
    options: ImageTransformOptions = {}
  ): string {
    // If CDN is not configured or it's a mock URL, return original
    if (!this.isConfigured() || originalUrl.includes('mock') || originalUrl.includes('placeholder')) {
      return originalUrl
    }

    const url = new URL(originalUrl)
    const params = new URLSearchParams()

    // Add transformation parameters
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', Math.min(100, Math.max(1, options.quality)).toString())
    if (options.format) params.set('f', options.format)
    if (options.fit) params.set('fit', options.fit)

    // Add compression if enabled
    if (this.config.enableCompression) {
      params.set('compress', 'true')
    }

    // Add WebP support if enabled and browser supports it
    if (this.config.enableWebP && !options.format) {
      params.set('auto', 'webp')
    }

    // Append parameters to URL
    if (params.toString()) {
      url.search = params.toString()
    }

    return url.toString()
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  public getResponsiveImageUrls(originalUrl: string): {
    small: string
    medium: string
    large: string
    original: string
  } {
    return {
      small: this.getOptimizedImageUrl(originalUrl, { width: 400, quality: 80 }),
      medium: this.getOptimizedImageUrl(originalUrl, { width: 800, quality: 85 }),
      large: this.getOptimizedImageUrl(originalUrl, { width: 1200, quality: 90 }),
      original: originalUrl
    }
  }

  /**
   * Generate thumbnail URL with consistent sizing
   */
  public getThumbnailUrl(
    originalUrl: string, 
    size: 'small' | 'medium' | 'large' = 'medium'
  ): string {
    const sizes = {
      small: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 500, height: 500 }
    }

    return this.getOptimizedImageUrl(originalUrl, {
      ...sizes[size],
      fit: 'cover',
      quality: 80
    })
  }

  /**
   * Generate video thumbnail URL
   */
  public getVideoThumbnailUrl(videoUrl: string, timeOffset: number = 0): string {
    if (!this.isConfigured() || videoUrl.includes('mock')) {
      return '/placeholder.svg?height=300&width=400'
    }

    const url = new URL(videoUrl)
    const params = new URLSearchParams()
    
    params.set('thumbnail', 'true')
    params.set('time', timeOffset.toString())
    params.set('w', '400')
    params.set('h', '300')
    params.set('fit', 'cover')

    url.search = params.toString()
    return url.toString()
  }

  /**
   * Generate cache-busting URL for updated files
   */
  public getCacheBustedUrl(originalUrl: string): string {
    const url = new URL(originalUrl)
    url.searchParams.set('v', Date.now().toString())
    return url.toString()
  }

  /**
   * Check if CDN is properly configured
   */
  public isConfigured(): boolean {
    return !!(
      this.config.domain &&
      !this.config.domain.includes('placeholder') &&
      (process.env.AWS_S3_BUCKET || process.env.CDN_DOMAIN)
    )
  }

  /**
   * Get CDN configuration
   */
  public getConfig(): CDNConfig {
    return { ...this.config }
  }

  /**
   * Preload critical images for better performance
   */
  public generatePreloadLinks(imageUrls: string[]): string[] {
    return imageUrls.map(url => {
      const optimizedUrl = this.getOptimizedImageUrl(url, { quality: 85 })
      return `<link rel="preload" as="image" href="${optimizedUrl}">`
    })
  }

  /**
   * Generate srcset for responsive images
   */
  public generateSrcSet(originalUrl: string): string {
    const sizes = [400, 800, 1200, 1600]
    
    return sizes
      .map(width => {
        const url = this.getOptimizedImageUrl(originalUrl, { width, quality: 85 })
        return `${url} ${width}w`
      })
      .join(', ')
  }

  /**
   * Validate if URL is from our CDN
   */
  public isOurCDNUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const cdnDomain = new URL(this.config.domain).hostname
      return urlObj.hostname === cdnDomain
    } catch {
      return false
    }
  }

  /**
   * Extract file path from CDN URL
   */
  public extractFilePathFromCDNUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname.substring(1) // Remove leading slash
    } catch {
      return ''
    }
  }
}

// Export singleton instance
export const cdnService = new CDNService()

// Helper function for Next.js Image component
export function getNextImageProps(
  src: string,
  alt: string,
  options: ImageTransformOptions & { priority?: boolean } = {}
) {
  const { priority = false, ...transformOptions } = options
  
  return {
    src: cdnService.getOptimizedImageUrl(src, transformOptions),
    alt,
    priority,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  }
}
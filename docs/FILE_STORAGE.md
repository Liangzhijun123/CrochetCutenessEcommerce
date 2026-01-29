# File Storage and CDN Integration

This document describes the file storage and CDN integration implementation for the Crochet Community Platform.

## Overview

The file storage system provides:
- AWS S3 integration for secure file storage
- Automatic thumbnail generation for images and videos
- CDN integration for fast content delivery
- Secure file access with signed URLs
- File validation and optimization
- Support for patterns, videos, thumbnails, and images

## Components

### 1. File Storage Service (`lib/file-storage.ts`)

Core service that handles:
- File uploads to AWS S3
- File validation (size, type, format)
- Thumbnail generation using Sharp
- Secure URL generation
- File deletion

**Key Features:**
- Organized file structure by type and creator
- Automatic thumbnail generation for images/videos
- Comprehensive file validation
- Fallback to mock implementation when AWS is not configured

### 2. File Upload Utilities (`lib/file-upload-utils.ts`)

Helper utilities for:
- Parsing multipart form data in Next.js
- File validation and sanitization
- Filename generation and formatting
- File metadata extraction

### 3. CDN Configuration (`lib/cdn-config.ts`)

CDN service that provides:
- Image optimization with transformation parameters
- Responsive image URL generation
- Video thumbnail generation
- Cache-busting URLs
- WebP format support

### 4. Client-side File Management (`lib/file-management-client.ts`)

Frontend utilities for:
- File upload with progress tracking
- Batch file operations
- File validation before upload
- Secure URL retrieval
- Image optimization requests

### 5. File Upload Component (`components/file-upload.tsx`)

React component featuring:
- Drag and drop file upload
- Progress tracking with visual feedback
- File preview generation
- Validation error handling
- Support for multiple file types

## API Endpoints

### File Upload
- **POST** `/api/patterns/upload`
- Handles file uploads with validation and storage
- Supports patterns, videos, thumbnails, and images
- Returns file URL and metadata

### Secure File Access
- **POST** `/api/files/secure-access`
- Generates signed URLs for secure file access
- **PUT** `/api/files/secure-access` - Batch URL generation
- Configurable expiration times (5 minutes to 24 hours)

### File Deletion
- **DELETE** `/api/files/delete`
- Secure file deletion with creator authorization
- **PUT** `/api/files/delete` - Batch file deletion
- Automatic thumbnail cleanup

### Image Optimization
- **POST** `/api/files/optimize`
- On-demand image optimization
- **PUT** `/api/files/optimize` - Batch optimization
- **PATCH** `/api/files/optimize` - Thumbnail generation

## Configuration

### Environment Variables

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=crochet-community-files

# CDN Configuration
CDN_DOMAIN=https://d1234567890.cloudfront.net
CDN_CACHE_TTL=86400
CDN_COMPRESSION=true
CDN_WEBP=true
```

### File Size Limits

- **Patterns**: 10MB (PDF, DOC, TXT)
- **Videos**: 200MB (MP4, WebM, MOV, AVI)
- **Thumbnails**: 5MB (JPG, PNG, WebP, GIF)
- **Images**: 5MB (JPG, PNG, WebP, GIF, SVG)

### Supported File Types

#### Patterns
- PDF documents
- Plain text files
- Microsoft Word documents (.doc, .docx)

#### Videos
- MP4, WebM, OGG
- AVI, MOV, QuickTime

#### Images
- JPEG, PNG, WebP
- GIF, SVG

## File Organization

Files are organized in S3 with the following structure:

```
bucket/
├── patterns/
│   └── {creatorId}/
│       └── {timestamp}_{fileId}_{filename}
├── videos/
│   └── {creatorId}/
│       └── {timestamp}_{fileId}_{filename}
├── images/
│   └── {creatorId}/
│       └── {timestamp}_{fileId}_{filename}
└── thumbnails/
    └── {creatorId}/
        └── {timestamp}_{fileId}_thumb.jpg
```

## Security Features

1. **File Validation**: Comprehensive validation of file types, sizes, and formats
2. **Signed URLs**: Temporary access URLs with configurable expiration
3. **Creator Authorization**: Files can only be deleted by their creators
4. **Sanitized Filenames**: Automatic filename sanitization for security
5. **Virus Scanning**: Ready for integration with virus scanning services

## Performance Optimizations

1. **CDN Integration**: Fast content delivery through CloudFront or similar
2. **Image Optimization**: Automatic WebP conversion and compression
3. **Responsive Images**: Multiple sizes generated for different screen sizes
4. **Thumbnail Generation**: Automatic thumbnail creation for images and videos
5. **Caching**: Configurable cache TTL for optimal performance

## Development Mode

When AWS credentials are not configured, the system falls back to:
- Mock file URLs for development
- Local file validation
- Simulated upload responses
- Warning messages in console

## Usage Examples

### Basic File Upload

```typescript
import { fileManagementClient } from '@/lib/file-management-client'

const result = await fileManagementClient.uploadFile(
  file,
  'pattern',
  'creator123',
  (progress) => console.log(`${progress.percentage}% uploaded`)
)

if (result.success) {
  console.log('File uploaded:', result.fileUrl)
}
```

### Secure File Access

```typescript
const { signedUrl } = await fileManagementClient.getSecureFileUrl(
  'https://bucket.s3.amazonaws.com/patterns/creator123/file.pdf',
  3600 // 1 hour expiration
)
```

### Image Optimization

```typescript
const { optimizedUrl, responsiveUrls } = await fileManagementClient.getOptimizedImageUrls(
  'https://bucket.s3.amazonaws.com/images/creator123/image.jpg',
  { width: 800, quality: 85, format: 'webp' }
)
```

## Monitoring and Logging

The system includes comprehensive logging for:
- File upload success/failure
- Validation errors
- S3 operation results
- CDN performance metrics
- Security events

## Future Enhancements

1. **Video Processing**: Integration with AWS MediaConvert for video optimization
2. **Virus Scanning**: Integration with ClamAV or similar services
3. **Analytics**: File access and performance analytics
4. **Backup**: Automated backup to secondary storage
5. **Compression**: Advanced compression algorithms for larger files

## Troubleshooting

### Common Issues

1. **Upload Failures**: Check AWS credentials and S3 bucket permissions
2. **Large File Timeouts**: Increase timeout settings for large video files
3. **Thumbnail Generation**: Ensure Sharp library is properly installed
4. **CDN Issues**: Verify CloudFront distribution configuration

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed logging for all file operations.
"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fileManagementClient, FileUploadProgress, FileUploadResult } from '@/lib/file-management-client'
import { Upload, X, File, Image, Video, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  fileType: 'pattern' | 'video' | 'thumbnail' | 'image'
  creatorId: string
  onUploadComplete?: (result: FileUploadResult) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  accept?: string
  className?: string
}

interface UploadingFile {
  file: File
  progress: FileUploadProgress
  result?: FileUploadResult
  preview?: string
}

export function FileUpload({
  fileType,
  creatorId,
  onUploadComplete,
  onUploadError,
  maxFiles = 1,
  accept,
  className = ""
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getAcceptedTypes = () => {
    if (accept) return accept
    
    const typeMap = {
      pattern: '.pdf,.txt,.doc,.docx',
      video: '.mp4,.webm,.ogg,.avi,.mov',
      thumbnail: '.jpg,.jpeg,.png,.webp,.gif',
      image: '.jpg,.jpeg,.png,.webp,.gif,.svg'
    }
    
    return typeMap[fileType]
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />
    if (file.type.startsWith('video/')) return <Video className="w-6 h-6" />
    if (file.type === 'application/pdf') return <FileText className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  const generatePreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      try {
        return await fileManagementClient.generatePreviewUrl(file)
      } catch (error) {
        console.warn('Failed to generate preview:', error)
      }
    }
    return undefined
  }

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles)
    
    // Validate files
    const validFiles: File[] = []
    for (const file of fileArray) {
      const validation = fileManagementClient.validateFile(file, fileType)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        onUploadError?.(validation.error || 'Invalid file')
      }
    }

    if (validFiles.length === 0) return

    // Initialize uploading files with previews
    const newUploadingFiles: UploadingFile[] = []
    for (const file of validFiles) {
      const preview = await generatePreview(file)
      newUploadingFiles.push({
        file,
        progress: { loaded: 0, total: file.size, percentage: 0 },
        preview
      })
    }

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Start uploads
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const fileIndex = uploadingFiles.length + i

      try {
        const result = await fileManagementClient.uploadFile(
          file,
          fileType,
          creatorId,
          (progress) => {
            setUploadingFiles(prev => 
              prev.map((uploadingFile, index) => 
                index === fileIndex 
                  ? { ...uploadingFile, progress }
                  : uploadingFile
              )
            )
          }
        )

        setUploadingFiles(prev => 
          prev.map((uploadingFile, index) => 
            index === fileIndex 
              ? { ...uploadingFile, result }
              : uploadingFile
          )
        )

        if (result.success) {
          onUploadComplete?.(result)
        } else {
          onUploadError?.(result.error || 'Upload failed')
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        setUploadingFiles(prev => 
          prev.map((uploadingFile, index) => 
            index === fileIndex 
              ? { 
                  ...uploadingFile, 
                  result: { success: false, error: errorMessage }
                }
              : uploadingFile
          )
        )
        onUploadError?.(errorMessage)
      }
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [fileType, creatorId, maxFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-pink-400 bg-pink-50' 
            : 'border-gray-300 hover:border-pink-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop {fileType} files here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {maxFiles > 1 ? `Up to ${maxFiles} files` : 'Single file'} • 
            {fileType === 'pattern' && ' PDF, DOC, TXT (max 10MB)'}
            {fileType === 'video' && ' MP4, WebM, MOV (max 200MB)'}
            {fileType === 'thumbnail' && ' JPG, PNG, WebP (max 5MB)'}
            {fileType === 'image' && ' JPG, PNG, WebP, SVG (max 5MB)'}
          </p>
          <Button variant="outline" size="sm">
            Choose Files
          </Button>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        multiple={maxFiles > 1}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            {uploadingFiles.length === 1 ? 'Uploading File' : 'Uploading Files'}
          </h4>
          
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start space-x-4">
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {uploadingFile.preview ? (
                    <img 
                      src={uploadingFile.preview} 
                      alt="Preview" 
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(uploadingFile.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadingFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fileManagementClient.formatFileSize(uploadingFile.file.size)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadingFile.result ? (
                        uploadingFile.result.success ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )
                      ) : (
                        <Badge variant="secondary">
                          {uploadingFile.progress.percentage}%
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!uploadingFile.result && (
                    <Progress 
                      value={uploadingFile.progress.percentage} 
                      className="h-2"
                    />
                  )}

                  {/* Error Message */}
                  {uploadingFile.result && !uploadingFile.result.success && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {uploadingFile.result.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success Info */}
                  {uploadingFile.result && uploadingFile.result.success && (
                    <div className="mt-2 text-xs text-gray-500">
                      Uploaded successfully
                      {uploadingFile.result.mock && (
                        <Badge variant="outline" className="ml-2">Mock</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, Trash2, X, Upload, Check, Crop, RotateCcw, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDraggableCrochet } from "@/context/draggable-crochet-context"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const CROCHET_IMAGES = [
  "/images/crochet-bunny-transparent.png",
  "/images/crochet-bear-transparent.png",
  "/images/crochet-flower-transparent.png",
  "/images/crochet-star-transparent.png",
  "/images/crochet-heart-transparent.png",
]

export default function CrochetControlPanel() {
  const { addCrochetItem, resetCrochetItems } = useDraggableCrochet()
  const [isOpen, setIsOpen] = useState(false)
  const [size, setSize] = useState(80)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cropping state
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null)
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Rotation state
  const [rotation, setRotation] = useState(0)

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file)
    setUploadedImage(imageUrl)
    setCropDialogOpen(true)
    setRotation(0) // Reset rotation for new image

    // Close the popover
    setIsOpen(false)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Draw the image and crop overlay on canvas
  useEffect(() => {
    if (!cropDialogOpen || !uploadedImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create a new image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = uploadedImage
    imageRef.current = img

    img.onload = () => {
      // Calculate dimensions based on rotation
      let width = img.width
      let height = img.height

      // If rotated by 90 or 270 degrees, swap dimensions
      if (Math.abs(rotation % 180) === 90) {
        width = img.height
        height = img.width
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Translate to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Rotate canvas
      ctx.rotate((rotation * Math.PI) / 180)

      // Draw the image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      // Reset transformation
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      // Draw crop overlay if we have start and end points
      if (cropStart && cropEnd) {
        // Calculate crop rectangle
        const cropX = Math.min(cropStart.x, cropEnd.x)
        const cropY = Math.min(cropStart.y, cropEnd.y)
        const cropWidth = Math.abs(cropEnd.x - cropStart.x)
        const cropHeight = Math.abs(cropEnd.y - cropStart.y)

        // Draw dashed border
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(cropX, cropY, cropWidth, cropHeight)

        // Reset line dash
        ctx.setLineDash([])
      }
    }
  }, [cropDialogOpen, uploadedImage, cropStart, cropEnd, rotation])

  // Handle mouse events for cropping
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setCropStart({ x, y })
    setCropEnd({ x, y })
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || !cropStart) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setCropEnd({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Rotate image
  const rotateImage = (degrees: number) => {
    // Update rotation state
    setRotation((prev) => {
      // Normalize to 0-359 degrees
      let newRotation = (prev + degrees) % 360
      if (newRotation < 0) newRotation += 360
      return newRotation
    })

    // Reset crop selection when rotating
    setCropStart(null)
    setCropEnd(null)
  }

  // Apply the crop and add the image
  const applyCrop = () => {
    if (!cropStart || !cropEnd || !canvasRef.current || !imageRef.current) return

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement("canvas")
    const ctx = cropCanvas.getContext("2d")
    if (!ctx) return

    // Calculate crop rectangle
    const cropX = Math.min(cropStart.x, cropEnd.x)
    const cropY = Math.min(cropStart.y, cropEnd.y)
    const cropWidth = Math.abs(cropEnd.x - cropStart.x)
    const cropHeight = Math.abs(cropEnd.y - cropStart.y)

    // Set dimensions for the output canvas
    cropCanvas.width = cropWidth
    cropCanvas.height = cropHeight

    // Get the current canvas with the rotated image
    const currentCanvas = canvasRef.current

    // Draw the cropped portion from the current canvas
    ctx.drawImage(currentCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

    // Convert to data URL
    const croppedImageUrl = cropCanvas.toDataURL("image/png")

    // Add the cropped image as a draggable item
    // Only run on client
    let randomX = 0, randomY = 0
    if (typeof window !== "undefined") {
      randomX = Math.floor(Math.random() * (window.innerWidth - 100))
      randomY = Math.floor(Math.random() * (window.innerHeight - 100))
    }

    addCrochetItem({
      image: croppedImageUrl,
      position: { x: randomX, y: randomY },
      size,
      zIndex: 10 + (typeof window !== "undefined" ? Math.floor(Math.random() * 10) : 0),
    })

    // Clean up
    setCropDialogOpen(false)
    setUploadedImage(null)
    setCropStart(null)
    setCropEnd(null)
    setRotation(0)

    // Revoke the object URL to avoid memory leaks
    if (uploadedImage) URL.revokeObjectURL(uploadedImage)
  }

  // Reset crop
  const resetCrop = () => {
    setCropStart(null)
    setCropEnd(null)
  }

  // Cancel crop
  const cancelCrop = () => {
    setCropDialogOpen(false)
    setUploadedImage(null)
    setCropStart(null)
    setCropEnd(null)
    setRotation(0)

    // Revoke the object URL to avoid memory leaks
    if (uploadedImage) URL.revokeObjectURL(uploadedImage)
  }

  const handleAddCrochet = (image: string) => {
    const randomX = Math.floor(Math.random() * (window.innerWidth - 100))
    const randomY = Math.floor(Math.random() * (window.innerHeight - 100))

    addCrochetItem({
      image,
      position: { x: randomX, y: randomY },
      size,
      zIndex: 10 + Math.floor(Math.random() * 10),
    })
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
          aria-label="Upload custom crochet image"
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              className="rounded-full h-12 w-12 bg-rose-500 hover:bg-rose-600 shadow-lg"
              aria-label="Add crochet items"
              onClick={() => (isOpen ? setIsOpen(false) : fileInputRef.current?.click())}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" side="top">
            <div className="space-y-4">
              <h3 className="font-medium text-center">Add Crochet Items</h3>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Size</p>
                <Slider value={[size]} min={40} max={150} step={5} onValueChange={(value) => setSize(value[0])} />
                <p className="text-xs text-right text-muted-foreground">{size}px</p>
              </div>

              <div className="mb-4">
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Custom Image
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {CROCHET_IMAGES.map((image, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-20 p-2 flex items-center justify-center"
                    onClick={() => handleAddCrochet(image)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Crochet item ${index + 1}`}
                      className="h-full object-contain"
                    />
                  </Button>
                ))}
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => {
                  resetCrochetItems()
                  setIsOpen(false)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove All
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Image Cropping Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Crop className="mr-2 h-5 w-5" />
              Crop Image
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click and drag on the image to select the area you want to crop.
              </p>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => rotateImage(-90)}
                  title="Rotate counterclockwise"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium">{rotation}°</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => rotateImage(90)}
                  title="Rotate clockwise"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative border rounded-md overflow-hidden bg-gray-100">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto mx-auto"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={resetCrop}>
                Reset Selection
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={cancelCrop}>
                  Cancel
                </Button>
                <Button onClick={applyCrop} disabled={!cropStart || !cropEnd}>
                  <Check className="mr-2 h-4 w-4" />
                  Apply Crop
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

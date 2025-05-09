"use client"

import { useState } from "react"

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0])

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
        <img
          src={mainImage || "/placeholder.svg"}
          alt={`${productName} - main view`}
          className="h-full w-full object-contain p-4"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            className={`relative aspect-square overflow-hidden rounded-md border ${
              mainImage === image ? "ring-2 ring-rose-500" : ""
            }`}
            onClick={() => setMainImage(image)}
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`${productName} - view ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Heart, ShoppingCart, Star, ChevronRight } from "lucide-react"

import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { Badge } from "@/components/ui/badge"

interface ProductQuickViewProps {
  product: any
  isOpen: boolean
  onClose: () => void
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "")
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "")
  const { addItem } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist()

  if (!product) return null

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      sellerId: product.sellerId,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
    })
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative h-[300px] md:h-[500px] bg-gray-100">
            <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>

          {/* Product Details */}
          <div className="p-6 overflow-y-auto max-h-[500px]">
            <div className="space-y-6">
              {/* Product Name and Price */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {product.category && (
                    <Badge variant="outline" className="text-xs">
                      {product.category.name}
                    </Badge>
                  )}
                  {product.isPattern ? (
                    <Badge variant="secondary" className="text-xs">
                      Pattern
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Plushie
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(product.averageRating || 4)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {(product.averageRating || 4).toFixed(1)} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold">${product.price.toFixed(2)}</div>
              </div>

              {/* Short Description */}
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Colors</h3>
                  <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
                    {product.colors.map((color: string) => (
                      <div key={color} className="flex items-center gap-2">
                        <RadioGroupItem id={`color-${color}`} value={color} className="peer sr-only" />
                        <Label
                          htmlFor={`color-${color}`}
                          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 peer-data-[state=checked]:border-primary"
                        >
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          <span className="text-sm capitalize">{color}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Size</h3>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <div key={size} className="flex items-center gap-2">
                        <RadioGroupItem id={`size-${size}`} value={size} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${size}`}
                          className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 peer-data-[state=checked]:border-primary"
                        >
                          <span className="text-sm uppercase">{size}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Yarn Details */}
              {product.yarnBrand && (
                <div>
                  <h3 className="font-medium mb-1">Yarn Details</h3>
                  <p className="text-sm">
                    <span className="font-medium">Brand:</span> {product.yarnBrand}
                  </p>
                  {product.yarnWeight && (
                    <p className="text-sm">
                      <span className="font-medium">Weight:</span> {product.yarnWeight}
                    </p>
                  )}
                </div>
              )}

              {/* Key Details */}
              <div>
                <h3 className="font-medium mb-1">Details</h3>
                <ul className="text-sm space-y-1">
                  {product.details?.slice(0, 3).map((detail: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-rose-200" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <Button className="flex-1" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={isInWishlist(product.id) ? "text-rose-500" : ""}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-rose-500" : ""}`} />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
              </div>

              {/* View Full Details Link */}
              <div>
                <Separator className="my-4" />
                <Link
                  href={`/product/${product.id}`}
                  className="inline-flex items-center text-sm text-rose-600 hover:text-rose-700"
                >
                  View full details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

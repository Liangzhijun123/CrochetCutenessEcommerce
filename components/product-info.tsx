"use client"

import { useState } from "react"
import { Heart, ShoppingCart, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { toast } from "@/hooks/use-toast"

interface ProductInfoProps {
  product: {
    id: string
    name: string
    price: number
    description: string
    sellerId?: string
    colors?: string[]
    rating?: number
    reviewCount?: number
    stock?: number
    sku?: string
    categories?: string[]
    images?: string[]
    productType?: string
  }
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined,
  )
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()

  // Safely extract values with defaults
  const { id = "", name = "", price = 0, description = "", colors = [], rating = 0, images = [], sellerId, productType: sellerProductType } = product || {}

  // Determine what's available based on seller's product type
  const hasPlushie = sellerProductType === "plushie" || sellerProductType === "both"
  const hasPdf = sellerProductType === "pdf_pattern" || sellerProductType === "both"

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      image: images[0] || "/placeholder.svg",
      sellerId: sellerId || "unknown",
      color: selectedColor,
      patternOption: hasPdf ? "with-pattern" : "no-pattern",
      productType: sellerProductType || "plushie",
    })
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(id)) {
      removeFromWishlist(id)
      toast({
        title: "Removed from wishlist",
        description: `${name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist({
        id,
        name,
        price,
        image: images[0] || "/placeholder.svg",
      })
      toast({
        title: "Added to wishlist",
        description: `${name} has been added to your wishlist.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {typeof rating === "number" ? rating.toFixed(1) : "0.0"} out of 5
          </span>
        </div>
        <div className="mt-4 text-2xl font-bold">${typeof price === "number" ? price.toFixed(2) : "0.00"}</div>
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">Description</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {colors.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-medium">Color</h2>
          <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <div key={color} className="flex items-center gap-2">
                <RadioGroupItem id={`color-${color}`} value={color} className="peer sr-only" />
                <Label
                  htmlFor={`color-${color}`}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 peer-data-[state=checked]:border-primary"
                >
                  <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.toLowerCase() }} />
                  <span className="text-sm capitalize">{color}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* What's Included - based on seller's product type */}
      <div className="space-y-2">
        <h2 className="font-medium">What&apos;s Included</h2>
        <div className="flex flex-wrap gap-2">
          {hasPlushie && (
            <div className="flex items-center gap-2 rounded-md border border-pink-200 bg-pink-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-pink-500" />
              <span className="text-sm font-medium text-pink-700">Handmade Plushie</span>
            </div>
          )}
          {hasPdf && (
            <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-blue-700">PDF Pattern</span>
            </div>
          )}
        </div>
        {hasPdf && hasPlushie && (
          <p className="text-xs text-muted-foreground">This listing includes both the finished plushie and the PDF pattern.</p>
        )}
        {hasPdf && !hasPlushie && (
          <p className="text-xs text-muted-foreground">Digital pattern delivered to your email after purchase.</p>
        )}
        {hasPlushie && !hasPdf && (
          <p className="text-xs text-muted-foreground">Handcrafted plushie shipped to your address.</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button className="flex-1" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleWishlistToggle}
          className={isInWishlist(id) ? "text-rose-500" : ""}
        >
          <Heart className={`h-4 w-4 ${isInWishlist(id) ? "fill-rose-500" : ""}`} />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>
    </div>
  )
}

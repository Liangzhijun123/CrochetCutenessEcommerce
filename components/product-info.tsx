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
  }
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined,
  )
  const [quantity, setQuantity] = useState(1)
  const [patternOption, setPatternOption] = useState("with-pattern")
  const [productType, setProductType] = useState("plushie-only")
  const { addItem } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist()

  // Safely extract values with defaults
  const { id = "", name = "", price = 0, description = "", colors = [], rating = 0, images = [], sellerId } = product || {}

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      image: images[0] || "/placeholder.svg",
      sellerId: sellerId || "unknown",
      color: selectedColor,
      patternOption,
      productType,
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

      {/* Pattern Options */}
      <div className="space-y-2">
        <h2 className="font-medium">Pattern Options</h2>
        <RadioGroup value={patternOption} onValueChange={setPatternOption} className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem id="with-pattern" value="with-pattern" className="peer sr-only" />
            <Label
              htmlFor="with-pattern"
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 peer-data-[state=checked]:border-primary"
            >
              <span className="text-sm">With Pattern</span>
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="no-pattern" value="no-pattern" className="peer sr-only" />
            <Label
              htmlFor="no-pattern"
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 peer-data-[state=checked]:border-primary"
            >
              <span className="text-sm">No Pattern</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Product Type Options */}
      <div className="space-y-2">
        <h2 className="font-medium">Product Type</h2>
        <RadioGroup value={productType} onValueChange={setProductType} className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem id="plushie-only" value="plushie-only" className="peer sr-only" />
            <Label
              htmlFor="plushie-only"
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 peer-data-[state=checked]:border-primary"
            >
              <span className="text-sm">Plushie Only</span>
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="pattern-only" value="pattern-only" className="peer sr-only" />
            <Label
              htmlFor="pattern-only"
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 peer-data-[state=checked]:border-primary"
            >
              <span className="text-sm">Pattern Only</span>
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="both" value="both" className="peer sr-only" />
            <Label
              htmlFor="both"
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 peer-data-[state=checked]:border-primary"
            >
              <span className="text-sm">Both Plushie & Pattern</span>
            </Label>
          </div>
        </RadioGroup>
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

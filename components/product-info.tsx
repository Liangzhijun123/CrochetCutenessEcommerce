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
  id: string
  name: string
  price: number
  description: string
  colors?: string[]
  averageRating?: number
  sellerId: string
  image: string
}

export default function ProductInfo({
  id,
  name,
  price,
  description,
  colors = [],
  averageRating = 0,
  sellerId,
  image,
}: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(colors.length > 0 ? colors[0] : undefined)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist()

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      image,
      sellerId,
      color: selectedColor,
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
        image,
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
                className={`h-4 w-4 ${i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{averageRating.toFixed(1)} out of 5</span>
        </div>
        <div className="mt-4 text-2xl font-bold">${price.toFixed(2)}</div>
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

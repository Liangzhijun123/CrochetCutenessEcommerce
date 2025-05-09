"use client"

import { useState } from "react"
import { Heart, ShoppingBag, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"

type ProductInfoProps = {
  product: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
    category: string
    sellerId: string
    stock: number
    colors?: string[]
    difficulty?: "beginner" | "intermediate" | "advanced"
    averageRating?: number
  }
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "")
  const { addItem } = useCart()
  const { addItem: addToWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      sellerId: product.sellerId,
    })
  }

  const handleAddToWishlist = () => {
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.averageRating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product.averageRating?.toFixed(1) || "No ratings"} ({product.averageRating ? "15 reviews" : "0 reviews"})
          </span>
        </div>
      </div>

      <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>

      <div className="prose max-w-none">
        <p>{product.description}</p>
      </div>

      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Color</h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                className={`h-8 w-8 rounded-full border-2 ${
                  selectedColor === color ? "border-rose-500" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
        </div>
      )}

      {product.difficulty && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Difficulty Level</h3>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              product.difficulty === "beginner"
                ? "bg-green-100 text-green-800"
                : product.difficulty === "intermediate"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {product.difficulty.charAt(0).toUpperCase() + product.difficulty.slice(1)}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button className="flex-1 bg-rose-500 hover:bg-rose-600" onClick={handleAddToCart}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button
          variant="outline"
          className={`flex-1 ${isInWishlist(product.id) ? "bg-rose-100 text-rose-700 hover:bg-rose-200" : ""}`}
          onClick={handleAddToWishlist}
        >
          <Heart className={`mr-2 h-4 w-4 ${isInWishlist(product.id) ? "fill-rose-500" : ""}`} />
          {isInWishlist(product.id) ? "Added to Wishlist" : "Add to Wishlist"}
        </Button>
      </div>

      <div className="rounded-md bg-muted p-4">
        <div className="flex items-center gap-2">
          <div className="font-medium">Availability:</div>
          {product.stock > 0 ? (
            <span className="text-green-600">In Stock ({product.stock} available)</span>
          ) : (
            <span className="text-red-600">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  )
}

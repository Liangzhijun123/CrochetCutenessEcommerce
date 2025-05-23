"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  category: string
  sellerId: string
  difficulty?: string
  materials?: string[]
  isPattern?: boolean
  showDetails?: boolean
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  category,
  sellerId,
  difficulty,
  materials,
  isPattern,
  showDetails,
}: ProductCardProps) {
  const { addItem } = useCart()
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist()

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      image,
      sellerId,
    })
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(id)) {
      removeFromWishlist(id)
    } else {
      addToWishlist({
        id,
        name,
        price,
        image,
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <Link href={`/product/${id}`}>
        <div className="aspect-square overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={300}
            height={300}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{category}</div>
        <Link href={`/product/${id}`} className="line-clamp-1 font-medium hover:underline">
          {name}
        </Link>
        <div className="mt-1 font-semibold">${price.toFixed(2)}</div>

        {showDetails && (
          <div className="mt-3 space-y-2 text-sm">
            {/* Difficulty Level */}
            {difficulty && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Difficulty:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    difficulty === "Beginner"
                      ? "bg-green-100 text-green-800"
                      : difficulty === "Intermediate"
                        ? "bg-yellow-100 text-yellow-800"
                        : difficulty === "Advanced"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {difficulty}
                </span>
              </div>
            )}

            {/* Available Colors */}
            {materials && materials.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Colors:</span>
                <div className="flex gap-1">
                  {materials.slice(0, 4).map((material, index) => (
                    <div
                      key={index}
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{
                        backgroundColor: material.toLowerCase().includes("red")
                          ? "#ef4444"
                          : material.toLowerCase().includes("blue")
                            ? "#3b82f6"
                            : material.toLowerCase().includes("green")
                              ? "#10b981"
                              : material.toLowerCase().includes("yellow")
                                ? "#f59e0b"
                                : material.toLowerCase().includes("pink")
                                  ? "#ec4899"
                                  : material.toLowerCase().includes("purple")
                                    ? "#8b5cf6"
                                    : material.toLowerCase().includes("orange")
                                      ? "#f97316"
                                      : material.toLowerCase().includes("brown")
                                        ? "#a3a3a3"
                                        : material.toLowerCase().includes("black")
                                          ? "#1f2937"
                                          : material.toLowerCase().includes("white")
                                            ? "#f9fafb"
                                            : "#6b7280",
                      }}
                      title={material}
                    />
                  ))}
                  {materials.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{materials.length - 4}</span>
                  )}
                </div>
              </div>
            )}

            {/* Product Type */}
            {isPattern !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Type:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isPattern ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {isPattern ? "Pattern" : "Plushie"}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
          <Heart className={`h-4 w-4 ${isInWishlist(id) ? "fill-rose-500 text-rose-500" : ""}`} />
          <span className="sr-only">Add to wishlist</span>
        </Button>
        <Button size="sm" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

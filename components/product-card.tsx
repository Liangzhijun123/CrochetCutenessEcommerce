"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Star } from "lucide-react"

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
  title,
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
    <div className="bg-[#FFF0F2] rounded-lg overflow-hidden">
      <div className="p-4">
        <Link href={`/product/${id}`}>
          <div className="aspect-square overflow-hidden rounded-md">
            <Image
              src={image || "/placeholder.svg"}
              alt={name || title}
              width={300}
              height={300}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>

        <div className="mt-4 bg-white rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-muted-foreground">Tags</div>
            <div className="text-xs text-muted-foreground">plushie, amigurumi</div>
          </div>

          <div className="flex items-center justify-between">
            <Link href={`/product/${id}`} className="font-medium line-clamp-1">
              {name || title}
            </Link>
            <div className="font-semibold">${price?.toFixed ? price.toFixed(2) : (price ?? "0.00")}</div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>4.0</span>
          </div>

          <div className="mt-3 text-sm space-y-2">
            {difficulty && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Difficulty:</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{difficulty}</span>
              </div>
            )}

            {isPattern !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Type:</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800">{isPattern ? "Pattern" : "Plushie"}</span>
              </div>
            )}

            {materials && materials.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Colors:</span>
                <div className="flex gap-1">
                  {materials.slice(0, 4).map((material, idx) => (
                    <div key={idx} className="w-3 h-3 rounded-full border" title={material} style={{ backgroundColor: material }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleWishlistToggle}
              aria-label="Favorite"
              className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm"
            >
              <Heart className={`h-5 w-5 ${isInWishlist(id) ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>

            <Button size="sm" onClick={handleAddToCart} className="flex items-center">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

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
}

export default function ProductCard({ id, name, price, image, category, sellerId }: ProductCardProps) {
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

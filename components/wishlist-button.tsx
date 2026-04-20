"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, ShoppingCart, Trash2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

export default function WishlistButton() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { items, removeItem } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAddToCart = (item: { id: string; name: string; price: number; image: string }) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      sellerId: "",
    })
    removeItem(item.id)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Heart className={`h-5 w-5 ${items.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white">
            {items.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-white shadow-lg z-50">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-sm">Saved Products ({items.length})</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!isAuthenticated ? (
              <div className="px-4 py-8 text-center">
                <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Sign in to save products</p>
                <Button size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No saved products yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the heart icon on products to save them here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <Link
                      href={`/product/${item.id}`}
                      className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.id}`}
                        className="text-sm font-medium truncate block hover:text-rose-500"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-rose-600 font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                        onClick={() => handleAddToCart(item)}
                        title="Add to cart"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated && items.length > 0 && (
            <div className="border-t px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-rose-500 border-rose-200 hover:bg-rose-50"
                asChild
              >
                <Link href="/shop" onClick={() => setIsOpen(false)}>
                  Continue Shopping
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Heart, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

export default function WishlistButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist()
  const { items: cartItems, addItem: addToCart, updateQuantity, removeItem: removeFromCart } = useCart()
  const { isAuthenticated } = useAuth()

  const getCartItem = (id: string) => cartItems.find((c) => c.id === id)

  const handleAddToCart = (item: { id: string; name: string; price: number; image: string }) => {
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, sellerId: "" })
  }

  const handleIncrement = (id: string) => {
    const cartItem = getCartItem(id)
    if (cartItem) updateQuantity(id, cartItem.quantity + 1)
  }

  const handleDecrement = (id: string) => {
    const cartItem = getCartItem(id)
    if (!cartItem) return
    if (cartItem.quantity > 1) {
      updateQuantity(id, cartItem.quantity - 1)
    } else {
      removeFromCart(id)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <Heart className={`h-5 w-5 ${wishlistItems.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
        {wishlistItems.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white">
            {wishlistItems.length}
          </span>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader className="pr-6">
            <SheetTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
              Saved Items
              {wishlistItems.length > 0 && (
                <span className="ml-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
                  {wishlistItems.length}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <Separator className="my-4" />

          <div className="flex flex-1 flex-col overflow-hidden">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 px-4">
                <Heart className="h-12 w-12 text-muted-foreground" />
                <p className="font-medium">Sign in to save items</p>
                <p className="text-sm text-muted-foreground">Your saved items will appear here</p>
                <Button className="bg-rose-500 hover:bg-rose-600" asChild onClick={() => setIsOpen(false)}>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 px-4">
                <Heart className="h-12 w-12 text-muted-foreground" />
                <p className="font-medium">No saved items yet</p>
                <p className="text-sm text-muted-foreground">
                  Tap the heart on any product to save it here
                </p>
                <Button className="bg-rose-500 hover:bg-rose-600" asChild onClick={() => setIsOpen(false)}>
                  <Link href="/shop">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {wishlistItems.map((item) => {
                    const cartItem = getCartItem(item.id)
                    const inCart = !!cartItem

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm"
                      >
                        {/* Product image */}
                        <Link
                          href={`/product/${item.id}`}
                          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border"
                          onClick={() => setIsOpen(false)}
                        >
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        {/* Info + controls */}
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <Link
                            href={`/product/${item.id}`}
                            className="text-sm font-medium line-clamp-2 hover:text-rose-500 leading-snug"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                          <p className="text-base font-bold text-rose-600">${item.price.toFixed(2)}</p>

                          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                            {inCart ? (
                              /* Quantity stepper */
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-full"
                                  onClick={() => handleDecrement(item.id)}
                                >
                                  <Minus className="h-3 w-3" />
                                  <span className="sr-only">Decrease</span>
                                </Button>
                                <span className="w-6 text-center text-sm font-semibold">
                                  {cartItem.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-full"
                                  onClick={() => handleIncrement(item.id)}
                                >
                                  <Plus className="h-3 w-3" />
                                  <span className="sr-only">Increase</span>
                                </Button>
                                <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                  In cart
                                </span>
                              </div>
                            ) : (
                              /* Add to cart button */
                              <Button
                                size="sm"
                                className="h-7 gap-1.5 rounded-full bg-rose-500 px-3 text-xs hover:bg-rose-600"
                                onClick={() => handleAddToCart(item)}
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                                Add to Cart
                              </Button>
                            )}

                            {/* Remove from wishlist */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                              onClick={() => removeFromWishlist(item.id)}
                              title="Remove from saved"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator className="my-4" />
                <Button
                  variant="outline"
                  className="w-full border-rose-200 text-rose-500 hover:bg-rose-50"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

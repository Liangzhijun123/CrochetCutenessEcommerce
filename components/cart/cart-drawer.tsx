"use client"

import { ShoppingCart } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/context/cart-context"
import CartItem from "@/components/cart/cart-item"
import CartEmpty from "@/components/cart/cart-empty"

export default function CartDrawer() {
  const { items, itemCount, subtotal, isCartOpen, closeCart } = useCart()

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Your Cart ({itemCount})
          </SheetTitle>
          <Separator />
        </SheetHeader>

        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={`${item.id}-${item.color || "default"}`} item={item} />
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Shipping</span>
                  <span className="text-sm text-muted-foreground">Calculated at checkout</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <Button asChild className="bg-rose-500 hover:bg-rose-600">
                    <Link href="/checkout" onClick={closeCart}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

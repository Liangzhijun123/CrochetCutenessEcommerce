"use client"

import { ShoppingCart } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"

export default function CartEmpty() {
  const { closeCart } = useCart()

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Looks like you haven&apos;t added anything to your cart yet.
      </p>
      <Button asChild className="mt-6" onClick={closeCart}>
        <Link href="/shop">Start Shopping</Link>
      </Button>
    </div>
  )
}

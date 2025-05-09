"use client"

import { ShoppingBag } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"

export default function CartEmpty() {
  const { closeCart } = useCart()

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium">Your cart is empty</h3>
        <p className="text-muted-foreground">Looks like you haven't added any items to your cart yet.</p>
      </div>
      <Button asChild className="bg-rose-500 hover:bg-rose-600" onClick={closeCart}>
        <Link href="/">Continue Shopping</Link>
      </Button>
    </div>
  )
}

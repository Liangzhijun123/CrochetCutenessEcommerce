"use client"

import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import type { CartItem as CartItemType } from "@/context/cart-context"

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    } else {
      removeItem(item.id)
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">{item.name}</h3>
          <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
        {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleDecrement}>
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <span className="w-5 text-center text-sm">{item.quantity}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleIncrement}>
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/context/cart-context"

interface CheckoutSummaryProps {
  items: CartItem[]
  subtotal: number
  shippingCost: number
}

export default function CheckoutSummary({ items, subtotal, shippingCost }: CheckoutSummaryProps) {
  const total = subtotal + shippingCost

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="max-h-80 overflow-y-auto space-y-4 pr-2">
            {items.map((item) => (
              <div key={`${item.id}-${item.color || "default"}`} className="flex gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white">
                    {item.quantity}
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{item.name}</span>
                  {item.color && <span className="text-xs text-muted-foreground">Color: {item.color}</span>}
                  <div className="mt-auto flex justify-between text-sm">
                    <span>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </span>
                    <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>Calculated at next step</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"

interface OrderReviewProps {
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  shippingMethod: {
    id: string
    name: string
    price: number
    estimatedDelivery: string
  }
  onBack: () => void
  onPlaceOrder: () => void
}

export default function OrderReview({ shippingInfo, shippingMethod, onBack, onPlaceOrder }: OrderReviewProps) {
  const { items, subtotal } = useCart()
  const total = subtotal + shippingMethod.price

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Order</CardTitle>
          <CardDescription>Please review your order details before placing your order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium">Shipping Information</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Contact</p>
                <p className="text-sm">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
                <p className="text-sm">{shippingInfo.email}</p>
                <p className="text-sm">{shippingInfo.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm">{shippingInfo.address}</p>
                <p className="text-sm">
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                </p>
                <p className="text-sm">{shippingInfo.country}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Shipping Method</h3>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{shippingMethod.name}</p>
                <p className="text-sm text-muted-foreground">{shippingMethod.estimatedDelivery}</p>
              </div>
              <p className="font-medium">${shippingMethod.price.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Payment</h3>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-12 rounded bg-muted"></div>
                <p className="text-sm">•••• •••• •••• 1234</p>
              </div>
              <p className="text-sm font-medium">Credit Card</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Order Items</h3>
            <Separator className="my-2" />
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.color || "default"}`} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
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
          </div>

          <div>
            <h3 className="font-medium">Order Summary</h3>
            <Separator className="my-2" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${shippingMethod.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-rose-50 p-4 text-sm">
            <p className="font-medium text-rose-700">Please Note:</p>
            <p className="mt-1 text-muted-foreground">
              By placing your order, you agree to our Terms of Service and Privacy Policy. Your items will be handmade
              to order and shipped within the timeframe specified.
            </p>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back to Payment
            </Button>
            <Button className="bg-rose-500 hover:bg-rose-600" onClick={onPlaceOrder}>
              Place Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

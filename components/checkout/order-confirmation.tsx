"use client"

import Link from "next/link"
import { CheckCircle2, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { useEffect } from "react"

interface OrderConfirmationProps {
  orderId: string
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  shippingMethod: {
    name: string
    estimatedDelivery: string
  }
}

export default function OrderConfirmation({ orderId, shippingInfo, shippingMethod }: OrderConfirmationProps) {
  const { clearCart } = useCart()

  // Clear the cart when order is confirmed
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-rose-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-rose-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
        <p className="mt-2 text-muted-foreground">Your order has been received and is being processed.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="rounded-lg bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Order Number</p>
                <p className="text-lg font-bold">{orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Order Date</p>
                <p className="text-sm">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Order Details</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Shipping Address</p>
                <p className="text-sm">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
                <p className="text-sm">{shippingInfo.address}</p>
                <p className="text-sm">
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                </p>
                <p className="text-sm">{shippingInfo.country}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Shipping Method</p>
                <p className="text-sm">{shippingMethod.name}</p>
                <p className="text-sm text-muted-foreground">{shippingMethod.estimatedDelivery}</p>

                <div className="mt-4">
                  <p className="text-sm font-medium">Contact Information</p>
                  <p className="text-sm">{shippingInfo.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 text-rose-500" />
              <div>
                <p className="font-medium text-rose-700">What happens next?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your order will be handmade with care. You'll receive an email confirmation shortly, and we'll notify
                  you when your order ships. Please allow 3-5 business days for your items to be crafted before
                  shipping.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link href="/">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#">Track Order</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

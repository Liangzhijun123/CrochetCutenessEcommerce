"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, CreditCard, Truck, User } from "lucide-react"

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
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Review Your Order</h2>
          <p className="text-sm text-muted-foreground">Please review your order details before placing your order.</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </h3>
            <Separator className="my-3" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm">{shippingInfo.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm">{shippingInfo.phone}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Information
            </h3>
            <Separator className="my-3" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm">{shippingInfo.address}</p>
              </div>
              <div>
                <p className="text-sm font-medium">City</p>
                <p className="text-sm">{shippingInfo.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium">State</p>
                <p className="text-sm">{shippingInfo.state}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Postal Code</p>
                <p className="text-sm">{shippingInfo.postalCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Country</p>
                <p className="text-sm">{shippingInfo.country}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium">Shipping Method</p>
              <div className="mt-1 flex justify-between text-sm">
                <p>{shippingMethod.name}</p>
                <p>${shippingMethod.price.toFixed(2)}</p>
              </div>
              <p className="text-xs text-muted-foreground">{shippingMethod.estimatedDelivery}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h3>
            <Separator className="my-3" />
            <div>
              <p className="text-sm font-medium">Payment Method</p>
              <p className="text-sm">Credit Card (ending in ****)</p>
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium">Billing Address</p>
              <p className="text-sm">Same as shipping address</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0 p-6 pt-0">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Payment
        </Button>
        <Button onClick={onPlaceOrder} className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600">
          Place Order
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Package, Truck, CreditCard } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import OrderConfirmationDetails from "@/components/checkout/order-confirmation-details"
import { useToast } from "@/hooks/use-toast"

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Attempt to fetch the order from the API
        const response = await fetch(`/api/orders/${orderId}`)

        if (response.ok) {
          const data = await response.json()
          setOrder(data)
        } else {
          // If API fails, check localStorage for order data
          const storedOrder = localStorage.getItem(`order_${orderId}`)
          if (storedOrder) {
            setOrder(JSON.parse(storedOrder))
          } else {
            // If no order found, redirect to home
            toast({
              title: "Order not found",
              description: "We couldn't find your order. You'll be redirected to the home page.",
              variant: "destructive",
            })
            setTimeout(() => router.push("/"), 3000)
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error retrieving order",
          description: "There was a problem retrieving your order details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router, toast])

  // If still loading, show skeleton
  if (loading) {
    return <OrderConfirmationSkeleton />
  }

  // If no order found after loading
  if (!order) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
              <p className="mb-6">We couldn't find the order you're looking for.</p>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
        <p className="mt-2 text-muted-foreground">Your order has been received and is being processed.</p>
      </div>

      <OrderConfirmationDetails order={order} />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Information
            </h3>
            <Separator className="my-3" />
            <div className="space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-sm text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="mt-4">
              <h4 className="font-medium">Shipping Method</h4>
              <p className="text-sm">{order.shippingMethod?.name || "Standard Shipping"}</p>
              <p className="text-sm text-muted-foreground">
                {order.shippingMethod?.description || "Delivery in 5-7 business days"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h3>
            <Separator className="my-3" />
            <div className="space-y-2">
              <p>
                <span className="font-medium">Payment Method:</span> {order.paymentMethod}
              </p>
              {order.paymentDetails?.cardNumber && (
                <p>
                  <span className="font-medium">Card:</span> •••• •••• ••••
                  {order.paymentDetails.cardNumber.slice(-4)}
                </p>
              )}
              <p>
                <span className="font-medium">Billing Address:</span> Same as shipping
              </p>
              <p>
                <span className="font-medium">Payment Status:</span>{" "}
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 rounded-lg bg-rose-50 p-4">
        <div className="flex items-start gap-3">
          <Package className="mt-0.5 h-5 w-5 text-rose-500" />
          <div>
            <p className="font-medium text-rose-700">What happens next?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your order will be handmade with care. You'll receive an email confirmation shortly, and we'll notify you
              when your order ships. Please allow 3-5 business days for your items to be crafted before shipping.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button asChild className="bg-rose-500 hover:bg-rose-600">
          <Link href="/">Continue Shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/profile/orders">View All Orders</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/profile/orders/${orderId}`}>Track Order</Link>
        </Button>
      </div>
    </div>
  )
}

function OrderConfirmationSkeleton() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <Skeleton className="h-18 w-18 rounded-full" />
        </div>
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto mt-2" />
      </div>

      <Skeleton className="h-64 w-full mb-8" />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>

      <Skeleton className="h-24 w-full mt-8" />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  )
}

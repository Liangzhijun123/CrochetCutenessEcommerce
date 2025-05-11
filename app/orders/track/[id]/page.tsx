"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Clock, Package, Truck, AlertCircle, ChevronLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import OrderTrackingTimeline from "@/components/orders/order-tracking-timeline"
import OrderTrackingMap from "@/components/orders/order-tracking-map"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${params.id}/tracking`)

        if (!response.ok) {
          throw new Error("Failed to fetch order tracking information")
        }

        const data = await response.json()
        setOrder(data)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("We couldn't find tracking information for this order. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-16 w-16" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile/orders">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button asChild>
                <Link href="/profile/orders">View Your Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile/orders">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mt-2">Track Your Order</h1>
        <p className="text-muted-foreground">
          Order #{order.id.slice(0, 8)} • Placed on {formatDate(order.createdAt)}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span>Order Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </CardTitle>
            {order.trackingNumber && (
              <div className="text-sm">
                <span className="text-muted-foreground mr-2">Tracking Number:</span>
                <span className="font-medium">{order.trackingNumber}</span>
              </div>
            )}
          </div>
          <CardDescription>
            {order.status === "delivered"
              ? "Your order has been delivered!"
              : order.status === "shipped"
                ? `Your order is on its way! Estimated delivery: ${formatDate(order.estimatedDelivery)}`
                : order.status === "processing"
                  ? "Your order is being prepared for shipping."
                  : order.status === "pending"
                    ? "Your order has been received and is pending processing."
                    : "Your order has been cancelled."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <OrderTrackingTimeline order={order} />

          {order.status === "shipped" && order.trackingDetails && (
            <OrderTrackingMap trackingDetails={order.trackingDetails} />
          )}
        </CardContent>
        {order.status === "shipped" && order.carrier && (
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`https://example.com/track/${order.trackingNumber}`} target="_blank">
                Track with {order.carrier}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.productId} className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-md border bg-gray-50">
                  <img
                    src={item.image || "/placeholder.svg?height=64&width=64"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium">{formatCurrency(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/contact">Need Help?</Link>
        </Button>
      </div>
    </div>
  )
}

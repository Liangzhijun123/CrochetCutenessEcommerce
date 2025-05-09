"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ChevronLeft, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import type { Order } from "@/lib/db"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/profile/orders")
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (response.ok) {
          const data = await response.json()

          // Verify this order belongs to the logged-in user
          if (data.userId !== user?.id) {
            router.push("/profile/orders")
            return
          }

          setOrder(data)
        } else {
          router.push("/profile/orders")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        router.push("/profile/orders")
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchOrder()
    }
  }, [params.id, user?.id, isAuthenticated, router])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "processing":
        return <Package className="h-6 w-6 text-blue-500" />
      case "shipped":
        return <Truck className="h-6 w-6 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "cancelled":
        return <AlertCircle className="h-6 w-6 text-red-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-48" />
        </div>
        <Separator className="my-6" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-full max-w-[250px]" />
                        <Skeleton className="mt-1 h-4 w-20" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Separator />
                  <Skeleton className="h-5 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/profile/orders">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <p className="mt-2 text-muted-foreground">Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}</p>
      </div>

      <Separator className="my-6" />

      <div className="mb-8 flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(order.status)}
          <div>
            <p className="font-medium">Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            <p className="text-sm text-muted-foreground">
              Last updated on {format(new Date(order.updatedAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        {order.trackingNumber && (
          <div>
            <p className="text-sm font-medium">Tracking Number</p>
            <p className="text-sm">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">{order.shippingAddress.phone}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.billingAddress.fullName}</p>
                <p>{order.billingAddress.addressLine1}</p>
                {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
                <p>
                  {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                </p>
                <p>{order.billingAddress.country}</p>
                <p className="mt-2">{order.billingAddress.phone}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span
                    className={
                      order.paymentStatus === "paid"
                        ? "text-green-600"
                        : order.paymentStatus === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>

              {order.status === "delivered" && (
                <Button className="mt-6 w-full bg-rose-500 hover:bg-rose-600">Leave a Review</Button>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>We're here to assist you with your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Return or Exchange
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

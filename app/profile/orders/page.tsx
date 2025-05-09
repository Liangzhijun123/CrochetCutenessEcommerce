"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Package, ChevronRight, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import type { Order } from "@/lib/db"

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/profile/orders")
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders?userId=${user?.id}`)
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchOrders()
    }
  }, [user?.id, isAuthenticated, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="mt-2 text-muted-foreground">View and track your order history</p>
      </div>

      <Separator className="my-6" />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No orders yet</h3>
          <p className="mb-6 text-sm text-muted-foreground">You haven't placed any orders yet.</p>
          <Button asChild className="bg-rose-500 hover:bg-rose-600">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <CardDescription>Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">${order.total.toFixed(2)}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tracking:</span>
                      <span className="font-medium">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Package className="h-4 w-4" />
                    Track Order
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href={`/profile/orders/${order.id}`}>
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

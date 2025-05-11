"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, Download, Send, AlertCircle } from "lucide-react"
import { formatDate, formatPrice } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/seller/order-status-badge"
import { OrderStatusUpdate } from "@/components/seller/order-status-update"
import { OrderNotes } from "@/components/seller/order-notes"
import { OrderTimeline } from "@/components/seller/order-timeline"
import { OrderCustomerInfo } from "@/components/seller/order-customer-info"

interface OrderDetailProps {
  orderId: string
}

export function SellerOrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      // In a real app, this would be a fetch to your API
      // For demo purposes, we'll create some mock data
      const mockOrder = {
        id: orderId,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString(),
        status: ["pending", "processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 5)],
        items: [
          {
            id: "item1",
            productId: "prod1",
            name: "Cute Bunny Amigurumi",
            price: 24.99,
            quantity: 2,
            image: "/placeholder.svg?height=80&width=80",
          },
          {
            id: "item2",
            productId: "prod2",
            name: "Cozy Baby Blanket",
            price: 39.99,
            quantity: 1,
            image: "/placeholder.svg?height=80&width=80",
          },
        ],
        customer: {
          id: "cust1",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "555-123-4567",
        },
        shippingAddress: {
          name: "Jane Smith",
          street: "123 Main St",
          street2: "Apt 4B",
          city: "Anytown",
          state: "CA",
          postalCode: "12345",
          country: "United States",
          phone: "555-123-4567",
        },
        billingAddress: {
          name: "Jane Smith",
          street: "123 Main St",
          street2: "Apt 4B",
          city: "Anytown",
          state: "CA",
          postalCode: "12345",
          country: "United States",
          phone: "555-123-4567",
        },
        paymentMethod: "Credit Card",
        paymentDetails: {
          cardType: "Visa",
          lastFour: "4242",
        },
        subtotal: 89.97,
        tax: 7.2,
        shipping: 4.99,
        total: 102.16,
        trackingNumber: "TRK123456789",
        carrier: "USPS",
        notes: "Please leave package at the door",
        timeline: [
          {
            status: "order_placed",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            message: "Order placed by customer",
          },
          {
            status: "payment_received",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
            message: "Payment received",
          },
          {
            status: "processing",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            message: "Order processing started",
          },
          {
            status: "shipped",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            message: "Order shipped via USPS",
          },
        ],
      }

      setOrder(mockOrder)
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      // In a real app, this would update the order status via API
      setOrder({
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...order.timeline,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            message: `Order marked as ${newStatus}`,
          },
        ],
      })
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const handleSendNotification = async () => {
    try {
      // In a real app, this would send an email notification via API
      alert("Notification sent to customer")
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  if (!order && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link href="/seller-dashboard/orders">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/seller-dashboard/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          </div>
          <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendNotification}>
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>Last updated on {formatDate(order.updatedAt)}</CardDescription>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdate currentStatus={order.status} onStatusUpdate={handleStatusUpdate} />
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.productId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(item.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm">
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="mt-1">{order.shippingAddress.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Shipping Method</h3>
                  <div className="text-sm">
                    <p>Standard Shipping</p>
                    <p className="text-muted-foreground">Delivered in 3-5 business days</p>

                    {order.trackingNumber && (
                      <div className="mt-4">
                        <h4 className="font-medium">Tracking Information</h4>
                        <p className="mt-1">
                          <span className="font-medium">Carrier:</span> {order.carrier}
                        </p>
                        <p>
                          <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                        </p>
                        <Button variant="link" className="p-0 h-auto mt-1">
                          View Tracking
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderNotes initialNotes={order.notes} orderId={order.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderCustomerInfo customer={order.customer} />
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Payment Method</h3>
                  <p>{order.paymentMethod}</p>
                  {order.paymentDetails && (
                    <p className="text-sm text-muted-foreground">
                      {order.paymentDetails.cardType} ending in {order.paymentDetails.lastFour}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Billing Address</h3>
                  <div className="text-sm">
                    <p>{order.billingAddress.name}</p>
                    <p>{order.billingAddress.street}</p>
                    {order.billingAddress.street2 && <p>{order.billingAddress.street2}</p>}
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline events={order.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

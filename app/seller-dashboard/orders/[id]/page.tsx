import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { UpdateOrderStatus } from "@/components/seller/update-order-status"

export default async function SellerOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SELLER") {
    redirect("/auth/login")
  }

  const sellerId = session.user.id
  const orderId = params.id

  // Get the order with only this seller's items
  const order = await db.order.findUnique({
    where: {
      id: orderId,
      items: {
        some: {
          product: {
            sellerId: sellerId,
          },
        },
      },
    },
    include: {
      items: {
        where: {
          product: {
            sellerId: sellerId,
          },
        },
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      shippingAddress: true,
    },
  })

  if (!order) {
    notFound()
  }

  // Calculate total for just this seller's items
  const sellerTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Link href="/seller-dashboard/orders">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>Placed on {formatDate(order.createdAt)}</CardDescription>
                </div>
                <Badge
                  variant={
                    order.status === "PENDING"
                      ? "outline"
                      : order.status === "PROCESSING"
                        ? "secondary"
                        : order.status === "SHIPPED"
                          ? "default"
                          : order.status === "DELIVERED"
                            ? "success"
                            : "destructive"
                  }
                  className="text-sm"
                >
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">Items</h3>
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
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.name}
                        {item.product.isPattern && (
                          <Badge variant="outline" className="ml-2">
                            Pattern
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatPrice(item.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-end">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between py-2">
                    <span>Subtotal</span>
                    <span>{formatPrice(sellerTotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between py-2 font-bold">
                    <span>Total</span>
                    <span>{formatPrice(sellerTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.user.name}</p>
              <p className="text-muted-foreground">{order.user.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <>
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p className="mt-2">{order.shippingAddress.phone}</p>}
                </>
              ) : (
                <p className="text-muted-foreground">No shipping address provided</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SELLER") {
    redirect("/auth/login")
  }

  const sellerId = session.user.id

  // Get all orders that contain products from this seller
  const orders = await db.order.findMany({
    where: {
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
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      {orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Orders Yet</CardTitle>
            <CardDescription>You haven't received any orders for your products yet.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>Manage and track orders for your products</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  // Calculate total for just this seller's items
                  const sellerTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.user.name}</TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell>{formatPrice(sellerTotal)}</TableCell>
                      <TableCell>
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
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/seller-dashboard/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

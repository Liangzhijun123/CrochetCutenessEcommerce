import { Calendar, ShoppingBag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  createdAt: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: string
}

export default function OrderConfirmationDetails({ order }: { order: Order }) {
  // Format the date
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <ShoppingBag className="h-5 w-5 text-rose-500" />
            <h2 className="text-xl font-bold">Order Summary</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Order Date: {orderDate}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Order #:</span> {order.id}
            </div>
            <div className="text-sm">
              <span className="font-medium">Status:</span>{" "}
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-start gap-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                <img
                  src={item.image || "/placeholder.svg?height=64&width=64"}
                  alt={item.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <p>Subtotal</p>
            <p>{formatCurrency(order.subtotal)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p>Shipping</p>
            <p>{formatCurrency(order.shipping)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p>Tax</p>
            <p>{formatCurrency(order.tax)}</p>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <p>Total</p>
            <p>{formatCurrency(order.total)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

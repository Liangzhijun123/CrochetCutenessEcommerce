import { Clock, Package, Truck, Home, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderTrackingTimelineProps {
  order: {
    status: string
    statusHistory?: {
      status: string
      timestamp: string
      description: string
    }[]
    createdAt: string
    processedAt?: string
    shippedAt?: string
    deliveredAt?: string
    cancelledAt?: string
    estimatedDelivery?: string
  }
}

export default function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  // Define the steps in the order process
  const steps = [
    {
      id: "pending",
      name: "Order Placed",
      description: "Your order has been received",
      icon: Clock,
      date: order.createdAt,
      complete: ["pending", "processing", "shipped", "delivered"].includes(order.status),
      current: order.status === "pending",
    },
    {
      id: "processing",
      name: "Processing",
      description: "Your order is being prepared",
      icon: Package,
      date: order.processedAt,
      complete: ["processing", "shipped", "delivered"].includes(order.status),
      current: order.status === "processing",
    },
    {
      id: "shipped",
      name: "Shipped",
      description: "Your order is on the way",
      icon: Truck,
      date: order.shippedAt,
      complete: ["shipped", "delivered"].includes(order.status),
      current: order.status === "shipped",
    },
    {
      id: "delivered",
      name: "Delivered",
      description: "Your order has been delivered",
      icon: Home,
      date: order.deliveredAt,
      complete: ["delivered"].includes(order.status),
      current: order.status === "delivered",
    },
  ]

  // If the order is cancelled, we show a different timeline
  if (order.status === "cancelled") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <div>
            <h3 className="font-medium text-red-800">Order Cancelled</h3>
            <p className="text-sm text-red-700">
              This order was cancelled on {new Date(order.cancelledAt || "").toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-4 top-4 -ml-px h-full w-0.5",
                    step.complete ? "bg-rose-600" : "bg-gray-200",
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      step.complete
                        ? "bg-rose-600"
                        : step.current
                          ? "border-2 border-rose-600 bg-white"
                          : "bg-gray-200",
                    )}
                  >
                    <step.icon
                      className={cn(
                        "h-5 w-5",
                        step.complete ? "text-white" : step.current ? "text-rose-600" : "text-gray-500",
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step.complete || step.current ? "text-gray-900" : "text-gray-500",
                      )}
                    >
                      {step.name}
                    </p>
                    <p className={cn("text-sm", step.complete || step.current ? "text-gray-600" : "text-gray-400")}>
                      {step.description}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {step.date ? (
                      <time dateTime={step.date}>{new Date(step.date).toLocaleDateString()}</time>
                    ) : step.id === "delivered" && order.estimatedDelivery ? (
                      <span className="text-gray-400">
                        Est. {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

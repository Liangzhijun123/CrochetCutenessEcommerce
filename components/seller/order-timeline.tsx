import { formatDate } from "@/lib/utils"

interface TimelineEvent {
  status: string
  timestamp: string
  message: string
}

interface OrderTimelineProps {
  events: TimelineEvent[]
}

export function OrderTimeline({ events }: OrderTimelineProps) {
  // Sort events by timestamp, newest first
  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <div key={index} className="relative pl-6 pb-4">
          {/* Timeline connector */}
          {index !== sortedEvents.length - 1 && (
            <div className="absolute left-[9px] top-[18px] bottom-0 w-[2px] bg-muted" />
          )}

          {/* Timeline dot */}
          <div className="absolute left-0 top-[6px] h-5 w-5 rounded-full border-2 border-primary bg-background" />

          {/* Event content */}
          <div>
            <p className="font-medium">{getStatusLabel(event.status)}</p>
            <p className="text-sm text-muted-foreground">{formatDate(event.timestamp, true)}</p>
            <p className="mt-1 text-sm">{event.message}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "order_placed":
      return "Order Placed"
    case "payment_received":
      return "Payment Received"
    case "processing":
      return "Processing"
    case "shipped":
      return "Shipped"
    case "delivered":
      return "Delivered"
    case "cancelled":
      return "Cancelled"
    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getOrderById } from "@/lib/local-storage-db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const order = getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Enhance the order with tracking information
    const enhancedOrder = {
      ...order,
      // Add tracking details based on status
      processedAt:
        order.status === "processing" || order.status === "shipped" || order.status === "delivered"
          ? new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 24).toISOString() // 1 day after creation
          : undefined,
      shippedAt:
        order.status === "shipped" || order.status === "delivered"
          ? new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days after creation
          : undefined,
      deliveredAt:
        order.status === "delivered"
          ? new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days after creation
          : undefined,
      cancelledAt:
        order.status === "cancelled"
          ? new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 12).toISOString() // 12 hours after creation
          : undefined,
      estimatedDelivery: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days after creation
      trackingNumber:
        order.status === "shipped" || order.status === "delivered"
          ? "CR" + Math.floor(Math.random() * 1000000000)
          : undefined,
      carrier: order.status === "shipped" || order.status === "delivered" ? "CrochetExpress" : undefined,
    }

    // Add simulated tracking details for shipped orders
    if (order.status === "shipped" || order.status === "delivered") {
      enhancedOrder.trackingDetails = {
        currentLocation: {
          lat: 37.7749,
          lng: -122.4194,
          timestamp: new Date().toISOString(),
          status: "In transit to destination",
        },
        origin: {
          lat: 40.7128,
          lng: -74.006,
          name: "Warehouse",
        },
        destination: {
          lat: 34.0522,
          lng: -118.2437,
          name: "Your Address",
        },
        stops: [
          {
            lat: 40.7128,
            lng: -74.006,
            timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 48).toISOString(),
            status: "Picked up by carrier",
          },
          {
            lat: 39.9526,
            lng: -75.1652,
            timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 36).toISOString(),
            status: "Arrived at sorting facility",
          },
          {
            lat: 37.7749,
            lng: -122.4194,
            timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 12).toISOString(),
            status: "In transit to destination",
          },
        ],
      }
    }

    return NextResponse.json(enhancedOrder)
  } catch (error) {
    console.error("Error fetching order tracking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createOrder, getUserById } from "@/lib/local-storage-db"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Validate required fields
    if (!orderData.userId || !orderData.items || !orderData.shippingAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the order
    const newOrder = createOrder({
      ...orderData,
      status: "pending",
      paymentStatus: "paid", // Assume payment is successful for demo
    })

    // Send confirmation email
    const user = getUserById(orderData.userId)
    if (user) {
      await sendEmail(user.email, "order-confirmation", {
        order: newOrder,
        user,
        orderId: newOrder.id,
        orderDate: newOrder.createdAt,
        items: newOrder.items,
        shippingAddress: newOrder.shippingAddress,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // This would typically include authentication and authorization
    // For demo purposes, we'll return all orders

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const sellerId = searchParams.get("sellerId")

    let orders = []

    if (userId) {
      // Get orders for a specific user
      orders = getOrdersByUser(userId)
    } else if (sellerId) {
      // Get orders for a specific seller
      orders = getOrdersBySeller(sellerId)
    } else {
      // Get all orders
      orders = getOrders()
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// Import these functions
import { getOrders, getOrdersByUser, getOrdersBySeller } from "@/lib/local-storage-db"

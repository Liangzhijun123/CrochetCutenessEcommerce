import { type NextRequest, NextResponse } from "next/server"
import { createOrder, getUserById } from "@/lib/local-storage-db"
import { sendEmail, type EmailTemplate } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Validate required fields
    if (!orderData.userId || !orderData.items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the order
    const newOrder = createOrder({
      ...orderData,
      status: "pending",
      paymentStatus: "paid", // Assume payment is successful for demo
    })

    // Send confirmation email to buyer
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

    // Notify sellers of physical (plushie) orders with buyer shipping info
    if (newOrder.shippingAddress) {
      const sellerIds = [...new Set(
        (newOrder.items as any[])
          .filter((item) => item.sellerId && (item.productType === "plushie" || item.productType === "both"))
          .map((item) => item.sellerId)
      )]

      for (const sellerId of sellerIds) {
        const seller = getUserById(sellerId as string)
        if (seller) {
          const sellerItems = (newOrder.items as any[]).filter((item) => item.sellerId === sellerId)
          await sendEmail(seller.email, "seller-new-order" as EmailTemplate, {
            order: newOrder,
            seller,
            buyerShippingAddress: newOrder.shippingAddress,
            items: sellerItems,
            orderId: newOrder.id,
            trackingNumber: (newOrder as any).trackingNumber,
          })
        }
      }
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

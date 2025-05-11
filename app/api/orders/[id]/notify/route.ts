import { type NextRequest, NextResponse } from "next/server"
import { getOrderById, getUserById } from "@/lib/local-storage-db"
import { sendEmail, type EmailTemplate } from "@/lib/email-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const order = getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const user = getUserById(order.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the status from the request body
    const { status } = await request.json()

    // Determine which email template to use based on status
    let template: EmailTemplate
    switch (status) {
      case "pending":
        template = "order-confirmation"
        break
      case "processing":
        template = "order-processing"
        break
      case "shipped":
        template = "order-shipped"
        break
      case "delivered":
        template = "order-delivered"
        break
      case "cancelled":
        template = "order-cancelled"
        break
      default:
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Send the email
    const emailResult = await sendEmail(user.email, template, {
      order,
      user,
      orderId: order.id,
      orderDate: order.createdAt,
      items: order.items,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
    })

    return NextResponse.json({
      success: true,
      message: `Email notification sent for order ${orderId}`,
      email: emailResult,
    })
  } catch (error) {
    console.error("Error sending order notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

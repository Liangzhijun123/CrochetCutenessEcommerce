import { type NextRequest, NextResponse } from "next/server"
import { getOrderById, updateOrder, getUserById } from "@/lib/local-storage-db"
import { sendEmail, type EmailTemplate } from "@/lib/email-service"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const order = getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const { status } = await request.json()

    // Validate status
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update the order
    const updatedOrder = updateOrder(orderId, {
      status,
      updatedAt: new Date().toISOString(),
      // Add tracking number if status is shipped
      ...(status === "shipped" && !order.trackingNumber
        ? {
            trackingNumber: "CR" + Math.floor(Math.random() * 1000000000),
            carrier: "CrochetExpress",
          }
        : {}),
    })

    // Get the user to send email
    const user = getUserById(order.userId)

    // Send email notification if user exists
    if (user) {
      // Determine which email template to use
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
          template = "order-confirmation"
      }

      // Send the email
      await sendEmail(user.email, template, {
        order: updatedOrder,
        user,
        orderId: updatedOrder.id,
        orderDate: updatedOrder.createdAt,
        items: updatedOrder.items,
        shippingAddress: updatedOrder.shippingAddress,
        trackingNumber: updatedOrder.trackingNumber,
        estimatedDelivery: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
      })
    }

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} status updated to ${status}`,
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}

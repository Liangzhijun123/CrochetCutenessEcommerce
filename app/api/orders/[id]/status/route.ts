import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only sellers and admins can update order status
    if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orderId = params.id
    const { status } = await request.json()

    if (!["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // If seller, verify they have items in this order
    if (session.user.role === "SELLER") {
      const order = await db.order.findFirst({
        where: {
          id: orderId,
          items: {
            some: {
              product: {
                sellerId: session.user.id,
              },
            },
          },
        },
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found or does not contain your products" }, { status: 404 })
      }
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
  }
}

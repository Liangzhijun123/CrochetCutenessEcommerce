import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const sellerId = searchParams.get("sellerId")

    let orders

    if (userId) {
      orders = db.getOrdersByUser(userId)
    } else if (sellerId) {
      orders = db.getOrdersBySeller(sellerId)
    } else {
      orders = db.getOrders()
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "An error occurred while fetching orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Validate required fields
    if (!orderData.userId || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ error: "UserId and items are required" }, { status: 400 })
    }

    const newOrder = db.createOrder(orderData)

    // Update product stock
    for (const item of orderData.items) {
      const product = db.getProductById(item.productId)
      if (product) {
        db.updateProduct(product.id, {
          stock: Math.max(0, product.stock - item.quantity),
        })
      }
    }

    return NextResponse.json(newOrder)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "An error occurred while creating the order" }, { status: 500 })
  }
}

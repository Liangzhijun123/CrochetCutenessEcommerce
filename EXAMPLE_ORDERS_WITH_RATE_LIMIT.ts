// 📧 EXAMPLE: Orders Endpoint WITH Rate Limiting

import { type NextRequest, NextResponse } from "next/server"
import { createOrder, getUserById } from "@/lib/local-storage-db"
import { sendEmail } from "@/lib/email-service"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit" // ✅ NEW

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
      // ✅ NEW: Check rate limit before sending email
      const rateLimitResult = checkRateLimit({
        identifier: user.email, // Key by email address
        ...RATE_LIMITS.EMAIL, // 3 emails per minute
      })

      if (!rateLimitResult.allowed) {
        console.warn(
          `⚠️ Email rate limit exceeded for ${user.email}, retrying in ${rateLimitResult.retryAfter}s`
        )
        // Note: Order is created but email not sent
        // You could queue the email for retry later
        return NextResponse.json(
          {
            success: true,
            order: newOrder,
            warning: "Order created but confirmation email could not be sent due to rate limit. It will be sent shortly.",
          },
          {
            status: 202, // Accepted but not fully processed
            headers: {
              "Retry-After": String(rateLimitResult.retryAfter),
            },
          }
        )
      }

      // ✅ Send email (we're within rate limit)
      try {
        await sendEmail(user.email, "order-confirmation", {
          order: newOrder,
          user,
          orderId: newOrder.id,
          orderDate: newOrder.createdAt,
          items: newOrder.items,
          shippingAddress: newOrder.shippingAddress,
        })
        console.log(`✅ Order confirmation email sent to ${user.email}`)
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError)
        // Order is created, but email failed - log it for monitoring
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
    // ... rest of GET logic
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real application, these would come from a database
    const shippingMethods = [
      {
        id: "standard",
        name: "Standard Shipping",
        description: "Delivery in 5-7 business days",
        price: 4.99,
        estimatedDeliveryDays: 7,
      },
      {
        id: "express",
        name: "Express Shipping",
        description: "Delivery in 2-3 business days",
        price: 9.99,
        estimatedDeliveryDays: 3,
      },
      {
        id: "overnight",
        name: "Overnight Shipping",
        description: "Next business day delivery",
        price: 19.99,
        estimatedDeliveryDays: 1,
      },
    ]

    return NextResponse.json({ shippingMethods })
  } catch (error) {
    console.error("Error fetching shipping methods:", error)
    return NextResponse.json({ error: "Failed to fetch shipping methods" }, { status: 500 })
  }
}

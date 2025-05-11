import { type NextRequest, NextResponse } from "next/server"

// Mock shipping rates
const shippingRates = {
  standard: 5.99,
  express: 12.99,
  overnight: 24.99,
}

export async function POST(request: NextRequest) {
  try {
    const { items, shippingMethod, address } = await request.json()

    // Validate required fields
    if (!items || !items.length || !shippingMethod || !address) {
      return NextResponse.json({ error: "Items, shipping method, and address are required" }, { status: 400 })
    }

    // Validate address
    if (!address.country || !address.postalCode) {
      return NextResponse.json({ error: "Country and postal code are required" }, { status: 400 })
    }

    // Get base shipping rate
    const baseRate = shippingRates[shippingMethod as keyof typeof shippingRates] || shippingRates.standard

    // Calculate total weight (in a real app, you would get this from the items)
    const totalWeight = items.reduce((sum: number, item: any) => sum + (item.weight || 0.5) * item.quantity, 0)

    // Calculate shipping cost based on weight and method
    let shippingCost = baseRate
    if (totalWeight > 5) {
      shippingCost += (totalWeight - 5) * 0.5 // Add $0.50 per pound over 5 pounds
    }

    // Apply international shipping surcharge if applicable
    if (address.country !== "US") {
      shippingCost *= 1.5 // 50% surcharge for international shipping
    }

    return NextResponse.json({
      shippingCost,
      estimatedDelivery: getEstimatedDelivery(shippingMethod),
      message: "Shipping cost calculated successfully",
    })
  } catch (error) {
    console.error("Shipping calculation error:", error)
    return NextResponse.json({ error: "An error occurred while calculating shipping" }, { status: 500 })
  }
}

// Helper function to calculate estimated delivery date
function getEstimatedDelivery(shippingMethod: string): string {
  const today = new Date()
  const deliveryDate = new Date(today)

  switch (shippingMethod) {
    case "standard":
      deliveryDate.setDate(today.getDate() + 5) // 5 business days
      break
    case "express":
      deliveryDate.setDate(today.getDate() + 2) // 2 business days
      break
    case "overnight":
      deliveryDate.setDate(today.getDate() + 1) // Next day
      break
    default:
      deliveryDate.setDate(today.getDate() + 5) // Default to standard
  }

  return deliveryDate.toISOString().split("T")[0] // Return YYYY-MM-DD format
}

import { type NextRequest, NextResponse } from "next/server"
import { getPaymentMethodsByUser, createPaymentMethod } from "@/lib/local-storage-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const methods = getPaymentMethodsByUser(userId)

    return NextResponse.json({ paymentMethods: methods })
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json({ error: "An error occurred while fetching payment methods" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const methodData = await request.json()

    // Validate required fields
    if (!methodData.userId || !methodData.type) {
      return NextResponse.json({ error: "User ID and payment type are required" }, { status: 400 })
    }

    const newMethod = createPaymentMethod(methodData)

    return NextResponse.json({ paymentMethod: newMethod }, { status: 201 })
  } catch (error) {
    console.error("Error creating payment method:", error)
    return NextResponse.json({ error: "An error occurred while creating the payment method" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import StripeService from "@/lib/stripe-service"
import { createTransaction, createReceipt, createCreatorEarning } from "@/lib/payment-db"
import { getPatternById } from "@/lib/pattern-db"
import { getUserById } from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    const { 
      patternId, 
      userId, 
      paymentMethodId,
      returnUrl 
    } = await request.json()

    // Validate required fields
    if (!patternId || !userId) {
      return NextResponse.json({ 
        error: "Pattern ID and User ID are required" 
      }, { status: 400 })
    }

    // Verify user exists
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 })
    }

    // Verify pattern exists
    const pattern = getPatternById(patternId)
    if (!pattern) {
      return NextResponse.json({ 
        error: "Pattern not found" 
      }, { status: 404 })
    }

    if (!pattern.isActive) {
      return NextResponse.json({ 
        error: "Pattern is not available for purchase" 
      }, { status: 400 })
    }

    // Calculate amounts (price is in dollars, convert to cents for Stripe)
    const amountInCents = Math.round(pattern.price * 100)
    const commission = StripeService.calculateCommission(amountInCents)

    // Create Stripe payment intent
    const paymentIntent = await StripeService.createPaymentIntent({
      amount: amountInCents,
      currency: 'usd',
      patternId,
      userId,
      creatorId: pattern.creatorId,
      metadata: {
        patternTitle: pattern.title,
        userEmail: user.email,
      }
    })

    // Create transaction record
    const transaction = createTransaction({
      userId,
      patternId,
      creatorId: pattern.creatorId,
      amount: amountInCents,
      currency: 'usd',
      platformFee: commission.platformFee,
      creatorRevenue: commission.creatorRevenue,
      paymentIntentId: paymentIntent.id,
      paymentMethod: 'stripe',
      status: 'pending',
      metadata: {
        patternTitle: pattern.title,
        userEmail: user.email,
      }
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction.id,
      amount: amountInCents,
      currency: 'usd',
      message: "Payment intent created successfully"
    })

  } catch (error) {
    console.error("Payment processing error:", error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "An error occurred while processing the payment" 
    }, { status: 500 })
  }
}

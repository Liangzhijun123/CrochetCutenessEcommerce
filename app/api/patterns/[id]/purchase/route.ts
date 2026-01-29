import { type NextRequest, NextResponse } from "next/server"
import { 
  getPatternById, 
  createPatternPurchase,
  userOwnsPattern
} from "@/lib/pattern-db"
import { getUserById } from "@/lib/local-storage-db"
import { getTransactionByPaymentIntent, updateTransaction } from "@/lib/payment-db"
import StripeService from "@/lib/stripe-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, paymentIntentId } = await request.json()

    // Validate required fields
    if (!userId || !paymentIntentId) {
      return NextResponse.json(
        { error: "User ID and payment intent ID are required" }, 
        { status: 400 }
      )
    }

    // Verify user exists
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      )
    }

    // Verify pattern exists
    const pattern = getPatternById(params.id)
    if (!pattern) {
      return NextResponse.json(
        { error: "Pattern not found" }, 
        { status: 404 }
      )
    }

    if (!pattern.isActive) {
      return NextResponse.json(
        { error: "Pattern is not available for purchase" }, 
        { status: 400 }
      )
    }

    // Check if user already owns this pattern
    if (userOwnsPattern(userId, params.id)) {
      return NextResponse.json(
        { error: "You already own this pattern" }, 
        { status: 400 }
      )
    }

    // Verify payment intent with Stripe
    const paymentIntent = await StripeService.getPaymentIntent(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: "Payment has not been completed successfully" }, 
        { status: 400 }
      )
    }

    // Get the transaction record
    const transaction = getTransactionByPaymentIntent(paymentIntentId)
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction record not found" }, 
        { status: 404 }
      )
    }

    if (transaction.status !== 'succeeded') {
      return NextResponse.json(
        { error: "Transaction is not in succeeded status" }, 
        { status: 400 }
      )
    }

    // Create the pattern purchase record (for user's library)
    const purchase = createPatternPurchase({
      userId,
      patternId: params.id,
      creatorId: pattern.creatorId,
      amountPaid: transaction.amount / 100, // Convert cents to dollars
      creatorCommission: transaction.creatorRevenue / 100,
      platformFee: transaction.platformFee / 100,
      paymentMethod: 'stripe',
      transactionId: paymentIntentId
    })

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        patternId: purchase.patternId,
        amountPaid: purchase.amountPaid,
        purchasedAt: purchase.purchasedAt,
        transactionId: purchase.transactionId
      },
      pattern: {
        id: pattern.id,
        title: pattern.title,
        patternFileUrl: pattern.patternFileUrl,
        tutorialVideoUrl: pattern.tutorialVideoUrl,
      },
      message: "Pattern purchased successfully! You now have access to the pattern and tutorial."
    }, { status: 201 })

  } catch (error) {
    console.error("Error processing pattern purchase:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "An error occurred while processing the purchase" }, 
      { status: 500 }
    )
  }
}
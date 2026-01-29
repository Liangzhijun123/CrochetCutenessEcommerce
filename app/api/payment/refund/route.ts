import { type NextRequest, NextResponse } from "next/server"
import StripeService from "@/lib/stripe-service"
import { 
  getTransactionById, 
  updateTransaction, 
  createRefund,
  updateCreatorEarning,
  getCreatorEarningsById
} from "@/lib/payment-db"

export async function POST(request: NextRequest) {
  try {
    const { 
      transactionId, 
      amount, 
      reason = 'requested_by_customer',
      adminId 
    } = await request.json()

    // Validate required fields
    if (!transactionId) {
      return NextResponse.json({ 
        error: "Transaction ID is required" 
      }, { status: 400 })
    }

    // Get transaction
    const transaction = getTransactionById(transactionId)
    if (!transaction) {
      return NextResponse.json({ 
        error: "Transaction not found" 
      }, { status: 404 })
    }

    if (transaction.status !== 'succeeded') {
      return NextResponse.json({ 
        error: "Can only refund successful transactions" 
      }, { status: 400 })
    }

    // Determine refund amount (full refund if not specified)
    const refundAmount = amount || transaction.amount

    if (refundAmount > transaction.amount) {
      return NextResponse.json({ 
        error: "Refund amount cannot exceed transaction amount" 
      }, { status: 400 })
    }

    // Create Stripe refund
    const stripeRefund = await StripeService.createRefund({
      paymentIntentId: transaction.paymentIntentId,
      amount: refundAmount,
      reason: reason as any,
    })

    // Create refund record
    const refund = createRefund({
      transactionId,
      stripeRefundId: stripeRefund.id,
      amount: refundAmount,
      reason: reason as any,
      status: 'pending',
    })

    // Update transaction status
    const isFullRefund = refundAmount === transaction.amount
    updateTransaction(transactionId, {
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      metadata: {
        ...transaction.metadata,
        refundedAmount: refundAmount,
        refundReason: reason,
        refundedBy: adminId,
      }
    })

    // Update creator earnings if full refund
    if (isFullRefund) {
      const creatorEarnings = getCreatorEarningsById(transaction.creatorId)
      const earning = creatorEarnings.find(e => e.transactionId === transactionId)
      
      if (earning && earning.status === 'available') {
        updateCreatorEarning(earning.id, {
          status: 'pending', // Hold the earning
          netAmount: 0,
        })
      }
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        stripeRefundId: stripeRefund.id,
        amount: refundAmount,
        status: stripeRefund.status,
        reason,
      },
      message: "Refund processed successfully"
    })

  } catch (error) {
    console.error("Refund processing error:", error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: "An error occurred while processing the refund" 
    }, { status: 500 })
  }
}
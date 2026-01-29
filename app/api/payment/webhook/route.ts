import { type NextRequest, NextResponse } from "next/server"
import StripeService from "@/lib/stripe-service"
import { 
  getTransactionByPaymentIntent, 
  updateTransaction, 
  createReceipt, 
  createCreatorEarning 
} from "@/lib/payment-db"
import { getPatternById } from "@/lib/pattern-db"
import { getUserById } from "@/lib/local-storage-db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
    }

    // Verify webhook signature
    const event = await StripeService.handleWebhook(body, signature)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as any)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as any)
        break
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as any)
        break
      
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as any)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook handler failed' 
    }, { status: 400 })
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    // Find the transaction
    const transaction = getTransactionByPaymentIntent(paymentIntent.id)
    if (!transaction) {
      console.error('Transaction not found for payment intent:', paymentIntent.id)
      return
    }

    // Update transaction status
    const updatedTransaction = updateTransaction(transaction.id, {
      status: 'succeeded',
      metadata: {
        ...transaction.metadata,
        stripeChargeId: paymentIntent.latest_charge,
      }
    })

    if (!updatedTransaction) {
      console.error('Failed to update transaction:', transaction.id)
      return
    }

    // Get pattern and user details for receipt
    const pattern = getPatternById(transaction.patternId)
    const user = getUserById(transaction.userId)

    if (!pattern || !user) {
      console.error('Pattern or user not found for transaction:', transaction.id)
      return
    }

    // Create receipt
    const receipt = createReceipt({
      transactionId: transaction.id,
      receiptNumber: transaction.receiptNumber,
      userId: transaction.userId,
      patternId: transaction.patternId,
      patternTitle: pattern.title,
      creatorName: `${user.firstName} ${user.lastName}`, // This should be creator name
      amount: transaction.amount,
      currency: transaction.currency,
      platformFee: transaction.platformFee,
      creatorRevenue: transaction.creatorRevenue,
      paymentMethod: 'stripe',
      purchaseDate: new Date().toISOString(),
    })

    // Create creator earning record
    const earning = createCreatorEarning({
      creatorId: transaction.creatorId,
      transactionId: transaction.id,
      patternId: transaction.patternId,
      grossAmount: transaction.amount,
      platformFee: transaction.platformFee,
      netAmount: transaction.creatorRevenue,
      status: 'available', // Available for payout
    })

    console.log('Payment succeeded processed:', {
      transactionId: transaction.id,
      receiptId: receipt.id,
      earningId: earning.id,
    })

  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  try {
    const transaction = getTransactionByPaymentIntent(paymentIntent.id)
    if (!transaction) {
      console.error('Transaction not found for payment intent:', paymentIntent.id)
      return
    }

    updateTransaction(transaction.id, {
      status: 'failed',
      metadata: {
        ...transaction.metadata,
        failureReason: paymentIntent.last_payment_error?.message,
      }
    })

    console.log('Payment failed processed:', transaction.id)

  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  try {
    const transaction = getTransactionByPaymentIntent(paymentIntent.id)
    if (!transaction) {
      console.error('Transaction not found for payment intent:', paymentIntent.id)
      return
    }

    updateTransaction(transaction.id, {
      status: 'canceled',
    })

    console.log('Payment canceled processed:', transaction.id)

  } catch (error) {
    console.error('Error handling payment canceled:', error)
  }
}

async function handleDisputeCreated(charge: any) {
  try {
    // Find transaction by charge ID
    // This would require storing charge ID in transaction metadata
    console.log('Dispute created for charge:', charge.id)
    
    // In a real implementation, you would:
    // 1. Find the related transaction
    // 2. Update transaction status to 'disputed'
    // 3. Notify the creator and admin
    // 4. Potentially hold creator earnings

  } catch (error) {
    console.error('Error handling dispute created:', error)
  }
}
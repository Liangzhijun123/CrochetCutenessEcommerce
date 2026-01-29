import { type NextRequest, NextResponse } from "next/server"
import { 
  getTransactionById, 
  updateTransaction,
  updateCreatorEarning,
  getCreatorEarningsById 
} from "@/lib/payment-db"

export interface DisputeData {
  transactionId: string
  disputeId: string
  reason: string
  amount: number
  status: 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'needs_response' | 'under_review' | 'charge_refunded' | 'won' | 'lost'
  evidenceDetails?: string
}

export async function POST(request: NextRequest) {
  try {
    const disputeData: DisputeData = await request.json()

    // Validate required fields
    if (!disputeData.transactionId || !disputeData.disputeId) {
      return NextResponse.json({ 
        error: "Transaction ID and dispute ID are required" 
      }, { status: 400 })
    }

    // Get transaction
    const transaction = getTransactionById(disputeData.transactionId)
    if (!transaction) {
      return NextResponse.json({ 
        error: "Transaction not found" 
      }, { status: 404 })
    }

    // Update transaction with dispute information
    const updatedTransaction = updateTransaction(disputeData.transactionId, {
      status: 'disputed' as any,
      metadata: {
        ...transaction.metadata,
        disputeId: disputeData.disputeId,
        disputeReason: disputeData.reason,
        disputeStatus: disputeData.status,
        disputeAmount: disputeData.amount,
        disputeCreatedAt: new Date().toISOString(),
      }
    })

    // Hold creator earnings if dispute is serious
    if (['needs_response', 'under_review'].includes(disputeData.status)) {
      const creatorEarnings = getCreatorEarningsById(transaction.creatorId)
      const earning = creatorEarnings.find(e => e.transactionId === disputeData.transactionId)
      
      if (earning && earning.status === 'available') {
        updateCreatorEarning(earning.id, {
          status: 'pending', // Hold the earning until dispute is resolved
        })
      }
    }

    return NextResponse.json({
      success: true,
      dispute: {
        id: disputeData.disputeId,
        transactionId: disputeData.transactionId,
        reason: disputeData.reason,
        amount: disputeData.amount,
        status: disputeData.status,
        createdAt: new Date().toISOString(),
      },
      message: "Dispute recorded successfully"
    })

  } catch (error) {
    console.error("Error handling dispute:", error)
    return NextResponse.json({ 
      error: "An error occurred while handling the dispute" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { transactionId, disputeStatus, resolution } = await request.json()

    if (!transactionId || !disputeStatus) {
      return NextResponse.json({ 
        error: "Transaction ID and dispute status are required" 
      }, { status: 400 })
    }

    // Get transaction
    const transaction = getTransactionById(transactionId)
    if (!transaction) {
      return NextResponse.json({ 
        error: "Transaction not found" 
      }, { status: 404 })
    }

    // Update transaction dispute status
    const updatedTransaction = updateTransaction(transactionId, {
      metadata: {
        ...transaction.metadata,
        disputeStatus,
        disputeResolvedAt: new Date().toISOString(),
        disputeResolution: resolution,
      }
    })

    // Handle earnings based on dispute resolution
    const creatorEarnings = getCreatorEarningsById(transaction.creatorId)
    const earning = creatorEarnings.find(e => e.transactionId === transactionId)

    if (earning) {
      if (disputeStatus === 'won') {
        // Creator won the dispute, release earnings
        updateCreatorEarning(earning.id, {
          status: 'available',
        })
      } else if (disputeStatus === 'lost' || disputeStatus === 'charge_refunded') {
        // Creator lost the dispute, forfeit earnings
        updateCreatorEarning(earning.id, {
          status: 'pending',
          netAmount: 0,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Dispute ${disputeStatus} successfully`,
      disputeResolution: {
        transactionId,
        status: disputeStatus,
        resolution,
        resolvedAt: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error("Error updating dispute:", error)
    return NextResponse.json({ 
      error: "An error occurred while updating the dispute" 
    }, { status: 500 })
  }
}
import { type NextRequest, NextResponse } from "next/server"
import { 
  getUserTransactions, 
  getCreatorTransactions,
  getTransactionStatus 
} from "@/lib/payment-db"
import { getPatternById } from "@/lib/pattern-db"
import { getUserById } from "@/lib/local-storage-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const creatorId = searchParams.get("creatorId")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!userId && !creatorId) {
      return NextResponse.json({ 
        error: "Either userId or creatorId is required" 
      }, { status: 400 })
    }

    // Get transactions based on user type
    let transactions = userId 
      ? getUserTransactions(userId)
      : getCreatorTransactions(creatorId!)

    // Sort by creation date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply pagination
    const paginatedTransactions = transactions.slice(offset, offset + limit)

    // Enrich transaction data
    const enrichedTransactions = await Promise.all(
      paginatedTransactions.map(async (transaction) => {
        const pattern = getPatternById(transaction.patternId)
        const user = getUserById(transaction.userId)
        const creator = getUserById(transaction.creatorId)
        const actualStatus = getTransactionStatus(transaction)

        return {
          id: transaction.id,
          patternId: transaction.patternId,
          patternTitle: pattern?.title || 'Unknown Pattern',
          patternThumbnail: pattern?.thumbnailUrl,
          amount: transaction.amount,
          currency: transaction.currency,
          platformFee: transaction.platformFee,
          creatorRevenue: transaction.creatorRevenue,
          status: actualStatus,
          paymentMethod: transaction.paymentMethod,
          receiptNumber: transaction.receiptNumber,
          purchaseDate: transaction.createdAt,
          user: user ? {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          } : null,
          creator: creator ? {
            id: creator.id,
            name: `${creator.firstName} ${creator.lastName}`,
            email: creator.email,
          } : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      transactions: enrichedTransactions,
      pagination: {
        total: transactions.length,
        limit,
        offset,
        hasMore: offset + limit < transactions.length,
      }
    })

  } catch (error) {
    console.error("Error fetching payment history:", error)
    return NextResponse.json({ 
      error: "An error occurred while fetching payment history" 
    }, { status: 500 })
  }
}
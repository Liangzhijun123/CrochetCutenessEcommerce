import { type NextRequest, NextResponse } from "next/server"
import { getReceiptById } from "@/lib/payment-db"

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const receiptId = params.id

    // Get receipt
    const receipt = getReceiptById(receiptId)
    if (!receipt) {
      return NextResponse.json({ 
        error: "Receipt not found" 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      receipt: {
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        transactionId: receipt.transactionId,
        patternTitle: receipt.patternTitle,
        creatorName: receipt.creatorName,
        amount: receipt.amount,
        currency: receipt.currency,
        platformFee: receipt.platformFee,
        creatorRevenue: receipt.creatorRevenue,
        paymentMethod: receipt.paymentMethod,
        purchaseDate: receipt.purchaseDate,
        downloadUrl: receipt.downloadUrl,
        createdAt: receipt.createdAt,
      }
    })

  } catch (error) {
    console.error("Error fetching receipt:", error)
    return NextResponse.json({ 
      error: "An error occurred while fetching the receipt" 
    }, { status: 500 })
  }
}
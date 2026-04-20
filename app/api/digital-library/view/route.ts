import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, password } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the user purchased this product
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("pattern_id", productId)
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: "You have not purchased this pattern" }, { status: 403 })
    }

    // Get the product with password and content
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, title, pdf_password, written_instructions, product_type")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Verify password if set
    if (product.pdf_password) {
      if (!password || password !== product.pdf_password) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
      }
    }

    // Return the pattern content (written instructions serve as the pattern content)
    return NextResponse.json({
      content: product.written_instructions || "No pattern content available. The seller has not yet uploaded pattern instructions.",
    })
  } catch (error) {
    console.error("Error in PDF viewer API:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

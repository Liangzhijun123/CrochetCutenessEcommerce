import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 })
    }

    // Look up the seller record for this user
    const { data: sellerRecord } = await supabaseAdmin
      .from("sellers")
      .select("id")
      .eq("user_id", sellerId)
      .single()

    const sellerDbId = sellerRecord?.id || sellerId

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("seller_id", sellerDbId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    return NextResponse.json({ success: true, products: products || [] })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "An error occurred while fetching products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.price || !body.sellerId) {
      return NextResponse.json({ error: "Name, price, and seller ID are required" }, { status: 400 })
    }

    // Look up the seller record
    const { data: sellerRecord } = await supabaseAdmin
      .from("sellers")
      .select("id")
      .eq("user_id", body.sellerId)
      .single()

    const sellerDbId = sellerRecord?.id || body.sellerId

    // Get next upload order
    const { data: maxOrder } = await supabaseAdmin
      .from("products")
      .select("upload_order")
      .order("upload_order", { ascending: false })
      .limit(1)
      .single()

    const uploadOrder = (maxOrder?.upload_order || 0) + 1

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert([{
        title: body.name,
        description: body.description || "",
        price: parseFloat(body.price),
        category: body.category || "general",
        seller_id: sellerDbId,
        image_url: body.images?.[0] || "/placeholder.svg?height=400&width=400",
        image_urls: body.images || [],
        difficulty_level: body.difficulty || "beginner",
        tags: body.tags || [],
        upload_order: uploadOrder,
        youtube_link: body.youtubeLink || null,
        written_instructions: body.writtenInstructions || null,
        product_type: body.productType || "plushie",
        pdf_password: body.pdfPassword || null,
        pdf_file_url: body.pdfFileUrl || null,
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "An error occurred while creating the product" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, sellerId, ...updates } = body

    if (!productId || !sellerId) {
      return NextResponse.json({ error: "Product ID and Seller ID are required" }, { status: 400 })
    }

    // Look up seller record
    const { data: sellerRecord } = await supabaseAdmin
      .from("sellers")
      .select("id")
      .eq("user_id", sellerId)
      .single()

    const sellerDbId = sellerRecord?.id || sellerId

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id, seller_id")
      .eq("id", productId)
      .single()

    if (!existing || existing.seller_id !== sellerDbId) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 403 })
    }

    // Build update fields (only allow safe fields)
    const allowedFields: Record<string, any> = {}
    if (updates.title !== undefined) allowedFields.title = updates.title
    if (updates.description !== undefined) allowedFields.description = updates.description
    if (updates.price !== undefined) allowedFields.price = parseFloat(updates.price)
    if (updates.category !== undefined) allowedFields.category = updates.category
    if (updates.difficulty_level !== undefined) allowedFields.difficulty_level = updates.difficulty_level
    if (updates.image_url !== undefined) allowedFields.image_url = updates.image_url
    if (updates.tags !== undefined) allowedFields.tags = updates.tags
    if (updates.youtube_link !== undefined) allowedFields.youtube_link = updates.youtube_link
    if (updates.written_instructions !== undefined) allowedFields.written_instructions = updates.written_instructions
    if (updates.image_urls !== undefined) {
      allowedFields.image_urls = updates.image_urls
      allowedFields.image_url = updates.image_urls[0] || null
    }
    if (updates.product_type !== undefined) allowedFields.product_type = updates.product_type
    if (updates.pdf_password !== undefined) allowedFields.pdf_password = updates.pdf_password
    if (updates.pdf_file_url !== undefined) allowedFields.pdf_file_url = updates.pdf_file_url
    if (updates.is_active !== undefined) allowedFields.is_active = updates.is_active

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    allowedFields.updated_at = new Date().toISOString()

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update(allowedFields)
      .eq("id", productId)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "An error occurred while updating the product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const sellerId = searchParams.get("sellerId")

    if (!productId || !sellerId) {
      return NextResponse.json({ error: "Product ID and Seller ID are required" }, { status: 400 })
    }

    // Look up seller record
    const { data: sellerRecord } = await supabaseAdmin
      .from("sellers")
      .select("id")
      .eq("user_id", sellerId)
      .single()

    const sellerDbId = sellerRecord?.id || sellerId

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id, seller_id")
      .eq("id", productId)
      .single()

    if (!existing || existing.seller_id !== sellerDbId) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "An error occurred while deleting the product" }, { status: 500 })
  }
}

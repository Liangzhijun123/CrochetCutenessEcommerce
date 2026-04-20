import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const sellerId = searchParams.get("sellerId")
    const featured = searchParams.get("featured")

    let query = supabaseAdmin.from("products").select("*, sellers(id, shop_name, country, state)")
      .eq("is_active", true)

    if (category) {
      query = query.eq("category", category)
    }

    if (sellerId) {
      // Look up the seller record for this user
      const { data: sellerRecord } = await supabaseAdmin
        .from("sellers")
        .select("id")
        .eq("user_id", sellerId)
        .single()
      const sellerDbId = sellerRecord?.id || sellerId
      query = query.eq("seller_id", sellerDbId)
    }

    const { data: products, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // Map Supabase columns to the shape the frontend expects
    const mapped = (products || []).map((p: any) => {
      const imgs = (p.image_urls && p.image_urls.length > 0) ? p.image_urls : (p.image_url ? [p.image_url] : ["/placeholder.svg?height=300&width=300"])
      return {
        id: p.id,
        name: p.title,
        description: p.description,
        price: p.price,
        images: imgs,
        image: imgs[0],
        category: p.category,
        sellerId: p.seller_id,
        stock: 1,
        difficulty: p.difficulty_level || "beginner",
        colors: [],
        tags: p.tags || [],
        featured: false,
        youtubeLink: p.youtube_link || "",
        writtenInstructions: p.written_instructions || "",
        productType: p.product_type || "plushie",
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        reviews: [],
        averageRating: p.rating || 0,
        views: p.views || 0,
        purchases: p.purchases || 0,
        seller: {
          id: p.seller_id,
          name: p.sellers?.shop_name || "Crochet Seller",
          shopName: p.sellers?.shop_name || "Crochet Shop",
          country: p.sellers?.country || null,
          state: p.sellers?.state || null,
        },
      }
    })

    return NextResponse.json({ products: mapped })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "An error occurred while fetching products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    // Validate required fields
    if (!productData.name || !productData.price || !productData.sellerId) {
      return NextResponse.json({ error: "Name, price, and sellerId are required" }, { status: 400 })
    }

    // Look up the seller record for this user
    let { data: sellerRecord } = await supabaseAdmin
      .from("sellers")
      .select("id")
      .eq("user_id", productData.sellerId)
      .maybeSingle()

    // If no seller record exists, check if the user is an approved seller and auto-create one
    if (!sellerRecord) {
      const { data: userRecord } = await supabaseAdmin
        .from("users")
        .select("id, full_name, email, role, is_seller")
        .eq("id", productData.sellerId)
        .single()

      if (userRecord && (userRecord.role === "seller" || userRecord.is_seller)) {
        const shopName = userRecord.full_name
          ? `${userRecord.full_name}'s Shop`
          : `${userRecord.email?.split("@")[0]}'s Shop`

        const { data: newSeller } = await supabaseAdmin
          .from("sellers")
          .insert({ user_id: productData.sellerId, shop_name: shopName })
          .select("id")
          .single()

        if (newSeller) {
          sellerRecord = newSeller
          // Link seller record back to user
          await supabaseAdmin
            .from("users")
            .update({ seller_id: newSeller.id })
            .eq("id", productData.sellerId)
        }
      }

      if (!sellerRecord) {
        return NextResponse.json(
          { error: "No seller account found. Please complete seller onboarding first." },
          { status: 400 }
        )
      }
    }

    const sellerDbId = sellerRecord.id

    // Get next upload order
    const { data: maxOrder } = await supabaseAdmin
      .from("products")
      .select("upload_order")
      .order("upload_order", { ascending: false })
      .limit(1)
      .single()

    const uploadOrder = (maxOrder?.upload_order || 0) + 1

    const imageUrls = productData.images || []
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert([{
        title: productData.name,
        description: productData.description || "",
        price: parseFloat(productData.price),
        category: productData.category || "general",
        seller_id: sellerDbId,
        image_url: imageUrls[0] || "/placeholder.svg?height=400&width=400",
        image_urls: imageUrls,
        difficulty_level: productData.difficulty || "beginner",
        tags: productData.tags || [],
        upload_order: uploadOrder,
        youtube_link: productData.youtubeLink || null,
        written_instructions: productData.writtenInstructions || null,
        product_type: productData.productType || "plushie",
        pdf_password: productData.pdfPassword || null,
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 })
    }

    // Map back to frontend shape
    const mapped = {
      id: product.id,
      name: product.title,
      description: product.description,
      price: product.price,
      images: product.image_url ? [product.image_url] : [],
      category: product.category,
      sellerId: product.seller_id,
      createdAt: product.created_at,
    }

    return NextResponse.json({ product: mapped }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "An error occurred while creating the product" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : 0
    const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : 1000
    const difficulty = searchParams.get("difficulty") || ""
    const tagsParam = searchParams.get("tags") || ""

    let dbQuery = supabaseAdmin.from("products").select("*, sellers(id, shop_name)")

    if (category) {
      dbQuery = dbQuery.eq("category", category)
    }

    if (difficulty) {
      dbQuery = dbQuery.eq("difficulty_level", difficulty)
    }

    if (tagsParam) {
      const tags = tagsParam.split(",").map(t => t.trim()).filter(Boolean)
      if (tags.length > 0) {
        dbQuery = dbQuery.overlaps("tags", tags)
      }
    }

    dbQuery = dbQuery.gte("price", minPrice).lte("price", maxPrice)

    const { data: products, error } = await dbQuery.order("created_at", { ascending: false })

    if (error) {
      console.error("Error searching products:", error)
      return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
    }

    let filtered = products || []

    // Text search on title and description
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery),
      )
    }

    // Map to frontend format
    const formattedProducts = filtered.map((p: any) => {
      const imgs = (p.image_urls && p.image_urls.length > 0) ? p.image_urls : (p.image_url ? [p.image_url] : ["/placeholder.svg?height=300&width=300"])
      return {
        id: p.id,
        name: p.title,
        description: p.description,
        price: p.price,
        images: imgs,
        categoryId: p.category,
        sellerId: p.seller_id,
        inventory: 1,
        difficulty: p.difficulty_level || "beginner",
        materials: [],
        dimensions: {},
        isPattern: p.product_type === "pdf_pattern",
        productType: p.product_type || "plushie",
        tags: p.tags || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at || p.created_at,
        averageRating: p.rating || 4,
        seller: {
          id: p.seller_id,
          name: p.sellers?.shop_name || "Crochet Seller",
          shopName: p.sellers?.shop_name || "Crochet Shop",
        },
        category: {
          id: p.category,
          name: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : "General",
        },
      }
    })

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ error: "An error occurred while searching products" }, { status: 500 })
  }
}

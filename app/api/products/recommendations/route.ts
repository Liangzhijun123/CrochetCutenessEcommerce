import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tagsParam = searchParams.get("tags")
  const excludeId = searchParams.get("excludeId")
  const limit = parseInt(searchParams.get("limit") || "4", 10)

  if (!tagsParam) {
    return NextResponse.json({ products: [] })
  }

  const tags = tagsParam.split(",").map(t => t.trim()).filter(Boolean)

  if (tags.length === 0) {
    return NextResponse.json({ products: [] })
  }

  // Find active products that share any of the given tags, excluding the current product
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*, sellers(id, shop_name)")
    .eq("is_active", true)
    .overlaps("tags", tags)
    .neq("id", excludeId || "")
    .limit(limit * 3) // fetch extra to allow sorting by relevance

  if (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json({ products: [] })
  }

  // Score products by number of matching tags (more matches = more relevant)
  const scored = (products || []).map((p: any) => {
    const productTags: string[] = p.tags || []
    const matchCount = productTags.filter((t: string) => tags.includes(t)).length
    return { product: p, matchCount }
  })

  // Sort by match count descending, then take top N
  scored.sort((a, b) => b.matchCount - a.matchCount)
  const topProducts = scored.slice(0, limit)

  const formatted = topProducts.map(({ product: p }: any) => {
    const imgs = (p.image_urls && p.image_urls.length > 0) ? p.image_urls : (p.image_url ? [p.image_url] : ["/placeholder.svg"])
    return {
      id: p.id,
      name: p.title,
      price: p.price,
      image: imgs[0],
      rating: p.rating || 0,
      productType: p.product_type || "plushie",
      tags: p.tags || [],
      sellerName: p.sellers?.shop_name || "Crochet Seller",
    }
  })

  return NextResponse.json({ products: formatted })
}

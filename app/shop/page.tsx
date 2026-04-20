import { ShopClientPage } from "./client-page"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type { FilterState } from "@/components/product-filters"

interface SearchParams {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  difficulty?: string
  isPattern?: string
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Parse search params
  const query = searchParams.q || ""
  const category = searchParams.category || ""
  const minPrice = searchParams.minPrice ? Number.parseFloat(searchParams.minPrice) : 0
  const maxPrice = searchParams.maxPrice ? Number.parseFloat(searchParams.maxPrice) : 500
  const difficulty = searchParams.difficulty || ""
  const isPattern = searchParams.isPattern === "true" ? true : searchParams.isPattern === "false" ? false : null

  // Query Supabase for products
  let dbQuery = supabaseAdmin.from("products").select("*, sellers(id, shop_name, country, state)")
    .eq("is_active", true)

  if (category) {
    dbQuery = dbQuery.eq("category", category)
  }

  if (difficulty) {
    dbQuery = dbQuery.eq("difficulty_level", difficulty)
  }

  dbQuery = dbQuery.gte("price", minPrice).lte("price", maxPrice)

  const { data: rawProducts } = await dbQuery.order("created_at", { ascending: false })

  let products = rawProducts || []

  // Text search on title and description
  if (query) {
    const lowerQuery = query.toLowerCase()
    products = products.filter(
      (p: any) =>
        p.title?.toLowerCase().includes(lowerQuery) || p.description?.toLowerCase().includes(lowerQuery),
    )
  }

  // Get all categories for the filter
  const categories = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean))).map((cat: any) => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
  }))

  // All available tags (matching product upload form)
  const allTags = [
    "Amigurumi", "Toy", "Stuffed Animal", "Doll", "Baby", "Blanket",
    "Hat", "Scarf", "Sweater", "Cardigan", "Bag", "Purse",
    "Home Decor", "Pillow", "Coaster", "Wall Hanging",
    "Holiday", "Christmas", "Halloween", "Easter",
    "Gift", "Keychain", "Bookmark", "Flowers",
    "Animals", "Bunny", "Bear", "Cat", "Dog", "Dinosaur",
    "Beginner Friendly", "Quick Project", "Eco Friendly",
    "Cotton", "Wool", "Acrylic", "Chunky Yarn",
  ]

  // Create initial filter state from search params
  const initialFilters: FilterState = {
    search: query,
    category: category,
    priceRange: [minPrice, maxPrice],
    difficulty: difficulty,
    isPattern: isPattern,
  }

  // Transform products to match the expected format in the client component
  const formattedProducts = products.map((p: any) => {
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
      rating: p.rating || 0,
      createdAt: p.created_at,
      updatedAt: p.updated_at || p.created_at,
      seller: {
        id: p.seller_id,
        name: p.sellers?.shop_name || "Crochet Seller",
        shopName: p.sellers?.shop_name || "Crochet Shop",
        country: p.sellers?.country || null,
        state: p.sellers?.state || null,
      },
      category: {
        id: p.category,
        name: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : "General",
      },
    }
  })

  return <ShopClientPage initialProducts={formattedProducts} categories={categories} availableTags={allTags} initialFilters={initialFilters} />
}

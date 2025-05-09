import { db } from "@/lib/db"
import { ShopClientPage } from "./client-page"
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

  // Get all products
  let products = db.getProducts()

  // Filter products based on search params
  if (query) {
    const lowerQuery = query.toLowerCase()
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) || product.description.toLowerCase().includes(lowerQuery),
    )
  }

  if (category) {
    products = products.filter((product) => product.category === category)
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    products = products.filter((product) => {
      if (minPrice !== undefined && product.price < minPrice) return false
      if (maxPrice !== undefined && product.price > maxPrice) return false
      return true
    })
  }

  if (difficulty) {
    products = products.filter((product) => product.difficulty === difficulty)
  }

  // Get all categories for the filter
  // Since we don't have a separate categories table, let's extract unique categories from products
  const categories = Array.from(new Set(products.map((product) => product.category))).map((category) => ({
    id: category,
    name: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
  }))

  // Create initial filter state from search params
  const initialFilters: FilterState = {
    search: query,
    category: category,
    priceRange: [minPrice, maxPrice],
    difficulty: difficulty,
    isPattern: isPattern,
  }

  // Transform products to match the expected format in the client component
  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    categoryId: product.category,
    sellerId: product.sellerId,
    inventory: product.stock,
    difficulty: product.difficulty || "beginner",
    materials: product.colors || [],
    dimensions: {},
    isPattern: false, // Add this field if it doesn't exist
    createdAt: product.createdAt,
    updatedAt: product.createdAt,
    seller: {
      id: product.sellerId,
      name: "Seller Name", // We would need to fetch this from the sellers table
      shopName: "Shop Name",
    },
    category: {
      id: product.category,
      name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
    },
  }))

  return <ShopClientPage initialProducts={formattedProducts} categories={categories} initialFilters={initialFilters} />
}

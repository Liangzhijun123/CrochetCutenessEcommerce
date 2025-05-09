import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : 0
    const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : 1000
    const difficulty = searchParams.get("difficulty") || ""
    const isPattern =
      searchParams.get("isPattern") === "true" ? true : searchParams.get("isPattern") === "false" ? false : null

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
      averageRating: product.averageRating || 4,
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

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ error: "An error occurred while searching products" }, { status: 500 })
  }
}
